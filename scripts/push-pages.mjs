// Force-push local page documents from .data/pages.json up to Neon,
// overwriting whatever the database currently holds.
//
// Workflow: pull -> edit .data/pages.json locally -> push.
//
// Usage:
//   node --env-file=.env.local scripts/push-pages.mjs
//   node --env-file=.env.local scripts/push-pages.mjs --slug=home
//   node --env-file=.env.local scripts/push-pages.mjs --dry-run
//   node --env-file=.env.local scripts/push-pages.mjs --yes   (skip confirmation)
//
// This is intentionally destructive: every pushed slug is overwritten in
// the database. Pull first if anyone may have edited via the admin editor.
import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";

const VALID_SLUGS = ["home", "about", "team", "contact"];
const REQUIRED_STRING_FIELDS = [
  "title",
  "description",
  "html",
  "css",
  "baseCss",
  "publishedHtml",
  "publishedCss",
  "publishedBaseCss",
  "publishedTitle",
  "publishedDescription",
  "createdAt",
  "updatedAt",
];

const slugArg = process.argv.find((arg) => arg.startsWith("--slug="))?.slice("--slug=".length);
if (slugArg && !VALID_SLUGS.includes(slugArg)) {
  throw new Error(`Unknown slug "${slugArg}". Valid slugs: ${VALID_SLUGS.join(", ")}`);
}
const dryRun = process.argv.includes("--dry-run");
const skipConfirm = process.argv.includes("--yes") || process.argv.includes("-y");

const connectionString = process.env.DATABASE_URL;
if (!connectionString && !dryRun) {
  throw new Error("DATABASE_URL is required. Run with --env-file=.env.local");
}

const source = JSON.parse(await readFile(".data/pages.json", "utf8"));
if (typeof source !== "object" || source === null || Array.isArray(source)) {
  throw new Error(".data/pages.json must contain a page map.");
}

const slugs = slugArg ? [slugArg] : Object.keys(source);
const now = new Date().toISOString();

const pending = [];
for (const slug of slugs) {
  const document = source[slug];
  if (typeof document !== "object" || document === null || document.slug !== slug) {
    throw new Error(`Invalid page data for "${slug}" in .data/pages.json (slug mismatch).`);
  }
  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof document[field] !== "string") {
      throw new Error(`Invalid page data for "${slug}": "${field}" must be a string.`);
    }
  }
  if (typeof document.published !== "boolean") {
    throw new Error(`Invalid page data for "${slug}": "published" must be a boolean.`);
  }
  pending.push({ slug, document: { ...document, updatedAt: now } });
}

if (pending.length === 0) {
  throw new Error("Nothing to push.");
}

if (dryRun) {
  for (const { slug, document } of pending) {
    console.log(
      `Would push "${slug}" (html: ${document.html.length} chars, publishedHtml: ${document.publishedHtml.length} chars, published: ${document.published})`,
    );
  }
  console.log("Dry run — database untouched.");
  process.exit(0);
}

if (!skipConfirm) {
  console.log(`\nAbout to OVERWRITE ${pending.length} page(s) in Neon:`);
  for (const { slug, document } of pending) {
    console.log(
      `  - "${slug}" (local updatedAt: ${document.updatedAt}, html: ${document.html.length} chars, published: ${document.published})`,
    );
  }
  console.log("Did you pull first? Any editor changes made after your last pull will be lost.");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question("Type YES to continue: ")).trim();
  rl.close();
  if (answer !== "YES") {
    console.log("Aborted. Database untouched.");
    process.exit(1);
  }
}

const sql = neon(connectionString);
await sql`
  CREATE TABLE IF NOT EXISTS site_pages (
    slug TEXT PRIMARY KEY CHECK (slug IN ('home', 'about', 'team', 'contact')),
    document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

for (const { slug, document } of pending) {
  await sql`
    INSERT INTO site_pages (slug, document)
    VALUES (${slug}, ${JSON.stringify(document)}::jsonb)
    ON CONFLICT (slug)
    DO UPDATE SET document = EXCLUDED.document, updated_at = NOW()
  `;
  console.log(`Pushed "${slug}" (overwrote database copy).`);
}
