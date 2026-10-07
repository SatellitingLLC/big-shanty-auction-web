import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required. Pull the rotated Neon credentials into .env.local first.");
}

const source = JSON.parse(await readFile(".data/pages.json", "utf8"));
if (typeof source !== "object" || source === null || Array.isArray(source)) {
  throw new Error(".data/pages.json must contain a page map.");
}

const sql = neon(connectionString);
await sql`
  CREATE TABLE IF NOT EXISTS site_pages (
    slug TEXT PRIMARY KEY CHECK (slug IN ('home', 'about', 'team', 'contact')),
    document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

for (const [slug, document] of Object.entries(source)) {
  if (
    !["home", "about", "team", "contact"].includes(slug) ||
    typeof document !== "object" ||
    document === null ||
    document.slug !== slug ||
    typeof document.html !== "string" ||
    typeof document.css !== "string"
  ) {
    throw new Error(`Invalid page data for "${slug}" in .data/pages.json.`);
  }

  const inserted = await sql`
    INSERT INTO site_pages (slug, document)
    VALUES (${slug}, ${JSON.stringify(document)}::jsonb)
    ON CONFLICT (slug) DO NOTHING
    RETURNING slug
  `;

  console.log(inserted.length ? `Imported ${slug}.` : `Kept existing database page ${slug}.`);
}
