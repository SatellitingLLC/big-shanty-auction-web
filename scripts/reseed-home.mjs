// Temp script: overwrite the stored home page with lib/page-seed.json.
// Safe to run once since nothing has been edited in production yet.
// Run with: node --env-file=.env.local scripts/reseed-home.mjs
import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required. Run with --env-file=.env.local");
}

const seed = JSON.parse(await readFile("lib/page-seed.json", "utf8"));
if (typeof seed.html !== "string" || typeof seed.css !== "string") {
  throw new Error("lib/page-seed.json must contain html and css strings.");
}

const now = new Date().toISOString();
const document = {
  slug: "home",
  title: seed.title,
  description: seed.description,
  html: seed.html,
  css: "",
  baseCss: seed.css,
  publishedHtml: seed.html,
  publishedCss: "",
  publishedBaseCss: seed.css,
  publishedTitle: seed.title,
  publishedDescription: seed.description,
  published: true,
  createdAt: now,
  updatedAt: now,
};

const sql = neon(connectionString);
await sql`
  CREATE TABLE IF NOT EXISTS site_pages (
    slug TEXT PRIMARY KEY CHECK (slug IN ('home', 'about', 'team', 'contact')),
    document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  INSERT INTO site_pages (slug, document)
  VALUES ('home', ${JSON.stringify(document)}::jsonb)
  ON CONFLICT (slug)
  DO UPDATE SET document = EXCLUDED.document, updated_at = NOW()
`;

console.log("Overwrote stored home page from lib/page-seed.json.");
