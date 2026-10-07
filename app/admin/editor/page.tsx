import { redirect } from "next/navigation";
import { connection } from "next/server";

import { LandingPageEditor } from "@/components/editor/LandingPageEditor";
import { isAuthenticated } from "@/lib/auth";
import { getPage } from "@/lib/page-store";

export default async function EditorPage() {
  await connection();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  const page = await getPage("home");

  return <LandingPageEditor page={page} />;
}
