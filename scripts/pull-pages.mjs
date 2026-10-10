// Pull page documents from Neon into .data/pages.json for local editing.
//
// Workflow: pull -> edit .data/pages.json locally -> push (force-updates the DB).
//
// Usage:
//   node --env-file=.env.local scripts/pull-pages.mjs
//   node --env-file=.env.local scripts/pull-pages.mjs --slug=home
//
// The previous local file is backed up to .data/pages.json.bak first.
import { neon } from "@neondatabase/serverless";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const VALID_SLUGS = ["home", "about", "team", "contact"];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required. Run with --env-file=.env.local");
}

const slugArg = process.argv.find((arg) => arg.startsWith("--slug="))?.slice("--slug=".length);
if (slugArg && !VALID_SLUGS.includes(slugArg)) {
  throw new Error(`Unknown slug "${slugArg}". Valid slugs: ${VALID_SLUGS.join(", ")}`);
}
const slugs = slugArg ? [slugArg] : VALID_SLUGS;

const sql = neon(connectionString);
const rows =
  slugs.length === 1
    ? await sql`SELECT slug, document FROM site_pages WHERE slug = ${slugs[0]}`
    : await sql`SELECT slug, document FROM site_pages WHERE slug = ANY(${slugs})`;

const pulled = {};
for (const row of rows) {
  const document = row.document;
  if (typeof document !== "object" || document === null || document.slug !== row.slug) {
    throw new Error(`Invalid page document stored for "${row.slug}". Aborting without writing.`);
  }
  pulled[row.slug] = document;
}

const missing = slugs.filter((slug) => !(slug in pulled));
for (const slug of missing) {
  console.log(`No database row for "${slug}" — leaving it out.`);
}

if (Object.keys(pulled).length === 0) {
  throw new Error("Nothing pulled. Aborting without writing.");
}

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "pages.json");
await mkdir(dataDir, { recursive: true });

// Merge with the existing local file so pulling one slug keeps the others.
let merged = { ...pulled };
try {
  const existing = JSON.parse(await readFile(dataFile, "utf8"));
  if (existing && typeof existing === "object" && !Array.isArray(existing)) {
    merged = { ...existing, ...pulled };
    await copyFile(dataFile, `${dataFile}.bak`);
    console.log("Backed up previous local file to .data/pages.json.bak");
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const temporaryFile = `${dataFile}.${randomUUID()}.tmp`;
await writeFile(temporaryFile, JSON.stringify(merged, null, 2) + "\n", "utf8");
await rename(temporaryFile, dataFile);

for (const [slug, document] of Object.entries(pulled)) {
  console.log(
    `Pulled "${slug}" (html: ${document.html?.length ?? 0} chars, published: ${document.published}, updatedAt: ${document.updatedAt})`,
  );
}
console.log(`Wrote .data/pages.json (${Object.keys(merged).length} page(s) total).`);
