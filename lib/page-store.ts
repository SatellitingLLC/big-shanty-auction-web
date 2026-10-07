import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  createEmptyPageDocument,
  initialPageDocument,
  isPageSlug,
  type PageDocument,
  type PageSlug,
} from "@/lib/page-seed";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "pages.json");

function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return neon(connectionString);
  }

  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("DATABASE_URL is required for persistent page storage in production.");
  }

  return null;
}

async function ensureDataFile() {
  try {
    await readFile(DATA_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify({ home: initialPageDocument }, null, 2), "utf8");
  }
}

async function readLocalPages(): Promise<Record<string, PageDocument>> {
  await ensureDataFile();
  const content = await readFile(DATA_FILE, "utf8");
  return JSON.parse(content || "{}") as Record<string, PageDocument>;
}

function isPageDocument(value: unknown, slug: string): value is PageDocument {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const page = value as Record<string, unknown>;
  return (
    page.slug === slug &&
    typeof page.title === "string" &&
    typeof page.description === "string" &&
    typeof page.html === "string" &&
    typeof page.css === "string" &&
    typeof page.baseCss === "string" &&
    typeof page.publishedHtml === "string" &&
    typeof page.publishedCss === "string" &&
    typeof page.publishedBaseCss === "string" &&
    typeof page.publishedTitle === "string" &&
    typeof page.publishedDescription === "string" &&
    typeof page.published === "boolean" &&
    typeof page.createdAt === "string" &&
    typeof page.updatedAt === "string"
  );
}

async function readStoredPage(slug: string): Promise<PageDocument | undefined> {
  const sql = getDatabase();
  if (sql) {
    const [row] = await sql`SELECT document FROM site_pages WHERE slug = ${slug} LIMIT 1`;
    if (!row) {
      return undefined;
    }
    if (!isPageDocument(row.document, slug)) {
      throw new Error(`Invalid page document stored for ${slug}.`);
    }
    return row.document;
  }

  const pages = await readLocalPages();
  return pages[slug];
}

function withPageDefaults(slug: PageSlug, saved: Partial<PageDocument> = {}): PageDocument {
  const fallback = slug === "home" ? initialPageDocument : createEmptyPageDocument(slug);

  return {
    ...fallback,
    ...saved,
    html: saved.html ?? fallback.html,
    css: saved.css ?? fallback.css,
    baseCss: saved.baseCss ?? fallback.baseCss,
    publishedHtml: saved.publishedHtml ?? (slug === "home" ? saved.html : undefined) ?? fallback.publishedHtml,
    publishedCss: saved.publishedCss ?? (slug === "home" ? saved.css : undefined) ?? fallback.publishedCss,
    publishedBaseCss:
      saved.publishedBaseCss ?? (slug === "home" ? saved.baseCss : undefined) ?? fallback.publishedBaseCss,
    publishedTitle: saved.publishedTitle ?? (slug === "home" ? saved.title : undefined) ?? fallback.publishedTitle,
    publishedDescription:
      saved.publishedDescription ??
      (slug === "home" ? saved.description : undefined) ??
      fallback.publishedDescription,
    createdAt: saved.createdAt ?? fallback.createdAt,
    updatedAt: saved.updatedAt ?? fallback.updatedAt,
  };
}

export async function getPage(slug: string): Promise<PageDocument> {
  if (!isPageSlug(slug)) {
    throw new Error(`Unknown page: ${slug}`);
  }

  return withPageDefaults(slug, await readStoredPage(slug));
}

export async function getPublishedPage(slug: string): Promise<PageDocument> {
  const page = await getPage(slug);

  return {
    ...page,
    title: page.publishedTitle,
    description: page.publishedDescription,
    html: page.publishedHtml,
    baseCss: page.publishedBaseCss,
    css: page.publishedCss,
  };
}

export async function savePage(
  page: Partial<PageDocument> & Pick<PageDocument, "slug" | "html" | "css">,
  publish = false,
): Promise<PageDocument> {
  if (!isPageSlug(page.slug)) {
    throw new Error(`Unknown page: ${page.slug}`);
  }

  const existing = await getPage(page.slug);
  const fallback = page.slug === "home" ? initialPageDocument : createEmptyPageDocument(page.slug);
  const nextSaved: PageDocument = {
    ...fallback,
    ...existing,
    ...page,
    title: page.title ?? existing.title ?? fallback.title,
    description: page.description ?? existing.description ?? fallback.description,
    published: publish || existing.published,
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt ?? fallback.createdAt,
  };

  if (publish) {
    nextSaved.publishedHtml = nextSaved.html;
    nextSaved.publishedCss = nextSaved.css;
    nextSaved.publishedBaseCss = nextSaved.baseCss;
    nextSaved.publishedTitle = nextSaved.title;
    nextSaved.publishedDescription = nextSaved.description;
  }

  const sql = getDatabase();
  if (sql) {
    await sql`
      INSERT INTO site_pages (slug, document)
      VALUES (${page.slug}, ${JSON.stringify(nextSaved)}::jsonb)
      ON CONFLICT (slug)
      DO UPDATE SET document = EXCLUDED.document, updated_at = NOW()
    `;
    return nextSaved;
  }

  const pages = await readLocalPages();
  pages[page.slug] = nextSaved;
  await mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${DATA_FILE}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(pages, null, 2), "utf8");
  await rename(temporaryFile, DATA_FILE);

  return nextSaved;
}
