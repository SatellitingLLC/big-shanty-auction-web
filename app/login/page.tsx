import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Big Shanty Auction",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <div>
        <Link className="admin-link" href="/">← Back to public site</Link>
        <LoginForm />
      </div>
    </main>
  );
}
