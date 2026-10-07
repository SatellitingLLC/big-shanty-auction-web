import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminPage() {
  await connection();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <main className="admin-shell">
      <nav>
        <Link className="admin-link" href="/">Public site</Link>
        <Link className="admin-link" href="/admin/editor">Open editor</Link>
        <LogoutButton />
      </nav>

      <section className="admin-panel">
        <div className="eyebrow">Dashboard</div>
        <h2>Landing page administration</h2>
        <p>Use the editor to update the content, style, and structure of the Big Shanty Auction landing page.</p>
        <div className="admin-actions">
          <Link className="save-button" href="/admin/editor">Edit Home</Link>
          <Link className="save-button" href="/admin/editor/about">Edit About</Link>
          <Link className="save-button" href="/admin/editor/team">Edit Team</Link>
          <Link className="save-button" href="/admin/editor/contact">Edit Contact</Link>
        </div>
      </section>
    </main>
  );
}
