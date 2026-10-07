import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  createEmptyPageDocument,
  initialPageDocument,
  isPageSlug,
  type PageDocument,
} from "@/lib/page-seed";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "pages.json");

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

export async function readPageStore(): Promise<Record<string, PageDocument>> {
  await ensureDataFile();

  const content = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(content || "{}") as Record<string, PageDocument>;
  const savedHome = parsed.home ?? {};

  return {
    ...parsed,
    home: {
      ...initialPageDocument,
      ...savedHome,
      html: savedHome.html ?? initialPageDocument.html,
      css: savedHome.css ?? initialPageDocument.css,
      baseCss: savedHome.baseCss ?? initialPageDocument.baseCss,
      publishedHtml: savedHome.publishedHtml ?? savedHome.html ?? initialPageDocument.publishedHtml,
      publishedCss: savedHome.publishedCss ?? savedHome.css ?? initialPageDocument.publishedCss,
      publishedBaseCss: savedHome.publishedBaseCss ?? savedHome.baseCss ?? initialPageDocument.publishedBaseCss,
      publishedTitle: savedHome.publishedTitle ?? savedHome.title ?? initialPageDocument.publishedTitle,
      publishedDescription:
        savedHome.publishedDescription ?? savedHome.description ?? initialPageDocument.publishedDescription,
    },
  };
}

export async function getPage(slug: string): Promise<PageDocument> {
  if (!isPageSlug(slug)) {
    throw new Error(`Unknown page: ${slug}`);
  }

  const pages = await readPageStore();
  const fallback = slug === "home" ? initialPageDocument : createEmptyPageDocument(slug);
  const saved = pages[slug] ?? fallback;

  return {
    ...fallback,
    ...saved,
    createdAt: saved.createdAt ?? fallback.createdAt,
    updatedAt: saved.updatedAt ?? fallback.updatedAt,
  };
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

  const pages = await readPageStore();
  const fallback = page.slug === "home" ? initialPageDocument : createEmptyPageDocument(page.slug);
  const nextSaved: PageDocument = {
    ...fallback,
    ...pages[page.slug],
    ...page,
    title: page.title ?? pages[page.slug]?.title ?? fallback.title,
    description: page.description ?? pages[page.slug]?.description ?? fallback.description,
    published: publish || (pages[page.slug]?.published ?? false),
    updatedAt: new Date().toISOString(),
    createdAt: pages[page.slug]?.createdAt ?? fallback.createdAt,
  };

  if (publish) {
    nextSaved.publishedHtml = nextSaved.html;
    nextSaved.publishedCss = nextSaved.css;
    nextSaved.publishedBaseCss = nextSaved.baseCss;
    nextSaved.publishedTitle = nextSaved.title;
    nextSaved.publishedDescription = nextSaved.description;
  }

  pages[page.slug] = nextSaved;
  await mkdir(DATA_DIR, { recursive: true });
  const temporaryFile = `${DATA_FILE}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(pages, null, 2), "utf8");
  await rename(temporaryFile, DATA_FILE);

  return nextSaved;
}
