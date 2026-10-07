import { neon } from "@neondatabase/serverless";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { readFile, writeFile } from "node:fs/promises";

const pageSlugs = new Set(["home", "about", "team", "contact"]);
const markupFields = ["html", "publishedHtml"];
const styleFields = ["css", "baseCss", "publishedCss", "publishedBaseCss"];
const localStorePath = ".data/pages.json";

function removeLegacyNavigationMarkup(html) {
  return html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>\s*/gi, "");
}

function removeLegacyNavigationStyles(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    const selectors = selectorParser()
      .astSync(rule.selector)
      .nodes.filter((selector) => {
        let isNavigation = false;
        selector.walkTags((tag) => {
          if (tag.value.toLowerCase() === "nav") isNavigation = true;
        });
        selector.walkClasses((className) => {
          if (["brand", "burger", "links", "tel"].includes(className.value)) {
            isNavigation = true;
          }
        });
        return !isNavigation;
      })
      .map((selector) => selector.toString());

    if (selectors.length === 0) {
      rule.remove();
    } else {
      rule.selector = selectors.join(", ");
    }
  });

  const hasDropAnimation = root.nodes.some((node) => {
    if (node.type !== "atrule" || !/keyframes$/i.test(node.name) || node.params.trim() !== "drop") {
      return false;
    }
    let referenced = false;
    root.walkDecls(/^(?:-webkit-)?animation(?:-name)?$/i, (declaration) => {
      if (new RegExp(`(^|[\\s,])drop(?=[\\s,]|$)`).test(declaration.value)) {
        referenced = true;
      }
    });
    return !referenced;
  });
  if (hasDropAnimation) {
    root.walkAtRules(/keyframes$/i, (rule) => {
      if (rule.params.trim() === "drop") rule.remove();
    });
  }

  return root.toString();
}

function cleanDocument(document) {
  let changed = false;
  for (const field of markupFields) {
    if (typeof document[field] === "string") {
      const cleaned = removeLegacyNavigationMarkup(document[field]);
      changed ||= cleaned !== document[field];
      document[field] = cleaned;
    }
  }
  for (const field of styleFields) {
    if (typeof document[field] === "string" && document[field]) {
      const cleaned = removeLegacyNavigationStyles(document[field]);
      changed ||= cleaned !== document[field];
      document[field] = cleaned;
    }
  }
  return changed;
}

let cleanedLocal = false;
const seedPath = "lib/page-seed.json";
const seed = JSON.parse(await readFile(seedPath, "utf8"));
cleanDocument(seed);
await writeFile(seedPath, JSON.stringify(seed, null, 2), "utf8");
console.log("Cleaned legacy navbar markup and styles from page seed data.");

try {
  const content = await readFile(localStorePath, "utf8");
  const pages = JSON.parse(content);
  for (const [slug, document] of Object.entries(pages)) {
    if (pageSlugs.has(slug) && typeof document === "object" && document !== null) {
      cleanDocument(document);
    }
  }
  await writeFile(localStorePath, JSON.stringify(pages, null, 2), "utf8");
  cleanedLocal = true;
  console.log("Cleaned legacy navbar markup and styles from local page data.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT slug, document FROM site_pages`;
  for (const row of rows) {
    if (!pageSlugs.has(row.slug) || typeof row.document !== "object" || row.document === null) {
      throw new Error(`Invalid page document stored for "${row.slug}".`);
    }

    const document = row.document;
    if (cleanDocument(document)) {
      await sql`
        UPDATE site_pages
        SET document = ${JSON.stringify(document)}::jsonb, updated_at = NOW()
        WHERE slug = ${row.slug}
      `;
      console.log(`Cleaned legacy navbar data for ${row.slug}.`);
    }
  }
}

if (!cleanedLocal && !process.env.DATABASE_URL) {
  throw new Error("No local page store or DATABASE_URL was found; nothing to clean.");
}
