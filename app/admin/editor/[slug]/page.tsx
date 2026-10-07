import { redirect } from "next/navigation";
import { connection } from "next/server";

import { LandingPageEditor } from "@/components/editor/LandingPageEditor";
import { isAuthenticated } from "@/lib/auth";
import { isPageSlug } from "@/lib/page-seed";
import { getPage } from "@/lib/page-store";

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;

  if (!isPageSlug(slug)) {
    redirect("/admin");
  }

  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const page = await getPage(slug);
  return <LandingPageEditor page={page} />;
}
