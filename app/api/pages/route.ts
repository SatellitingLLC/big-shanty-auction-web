import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAuthenticated, isSameOriginRequest } from "@/lib/auth";
import { scopeLandingPageCss } from "@/lib/page-css";
import { getPublishedPage, savePage } from "@/lib/page-store";
import { isPageSlug, type PageSlug } from "@/lib/page-seed";

type PageSaveBody = {
  slug: PageSlug;
  html: string;
  css: string;
  action: "draft" | "publish";
  title?: string;
  description?: string;
};

function isPageSaveBody(body: unknown): body is PageSaveBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const value = body as Record<string, unknown>;
  return (
    isPageSlug(value.slug) &&
    typeof value.html === "string" &&
    typeof value.css === "string" &&
    (value.action === "draft" || value.action === "publish") &&
    (value.title === undefined || typeof value.title === "string") &&
    (value.description === undefined || typeof value.description === "string")
  );
}

export async function GET() {
  const page = await getPublishedPage("home");
  return NextResponse.json(page);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!isPageSaveBody(body)) {
    return NextResponse.json({ message: "Valid page content is required." }, { status: 400 });
  }

  if (body.html.length > 250_000 || body.css.length > 250_000) {
    return NextResponse.json({ message: "Page content exceeds the allowed size." }, { status: 413 });
  }

  if ((body.title?.length ?? 0) > 160 || (body.description?.length ?? 0) > 500) {
    return NextResponse.json({ message: "Page metadata exceeds the allowed size." }, { status: 400 });
  }

  try {
    scopeLandingPageCss(body.css);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid page CSS.";
    return NextResponse.json({ message }, { status: 400 });
  }

  const publish = body.action === "publish";
  const page = await savePage(
    {
      slug: body.slug,
      title: body.title ?? undefined,
      description: body.description ?? undefined,
      html: body.html,
      css: body.css,
    },
    publish,
  );

  if (publish) {
    revalidatePath(body.slug === "home" ? "/" : `/${body.slug}`);
  }

  return NextResponse.json(
    { message: publish ? "Page published." : "Draft saved.", updatedAt: page.updatedAt },
    { status: 200 },
  );
}
