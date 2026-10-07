import seed from "@/lib/page-seed.json";

export type PageDocument = {
  slug: string;
  title: string;
  description: string;
  html: string;
  css: string;
  baseCss: string;
  publishedHtml: string;
  publishedCss: string;
  publishedBaseCss: string;
  publishedTitle: string;
  publishedDescription: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export const PAGE_SLUGS = ["home", "about", "team", "contact"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

const pageMetadata: Record<Exclude<PageSlug, "home">, Pick<PageDocument, "title" | "description">> = {
  about: {
    title: "About Us | Big Shanty Auction",
    description: "Learn about Big Shanty Auction.",
  },
  team: {
    title: "Our Team | Big Shanty Auction",
    description: "Meet the team behind Big Shanty Auction.",
  },
  contact: {
    title: "Contact Us | Big Shanty Auction",
    description: "Contact Big Shanty Auction in Marietta, Georgia.",
  },
};

export function isPageSlug(value: unknown): value is PageSlug {
  return typeof value === "string" && PAGE_SLUGS.includes(value as PageSlug);
}

export function createEmptyPageDocument(slug: Exclude<PageSlug, "home">): PageDocument {
  const now = new Date().toISOString();
  const metadata = pageMetadata[slug];

  return {
    slug,
    ...metadata,
    html: "",
    css: "",
    baseCss: "",
    publishedHtml: "",
    publishedCss: "",
    publishedBaseCss: "",
    publishedTitle: metadata.title,
    publishedDescription: metadata.description,
    published: false,
    createdAt: now,
    updatedAt: now,
  };
}

const seededAt = new Date().toISOString();

export const initialPageDocument: PageDocument = {
  ...seed,
  css: "",
  baseCss: seed.css,
  publishedHtml: seed.html,
  publishedCss: "",
  publishedBaseCss: seed.css,
  publishedTitle: seed.title,
  publishedDescription: seed.description,
  published: true,
  createdAt: seededAt,
  updatedAt: seededAt,
};
