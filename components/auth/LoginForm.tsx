"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ message: "Unable to log in." }))) as {
          message?: string;
        };
        throw new Error(payload.message ?? "Unable to log in.");
      }

      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-panel" onSubmit={handleSubmit}>
      <div className="login-header">
        <span className="eyebrow">Administrator access</span>
        <h1>Big Shanty Editor Login</h1>
      </div>

      <label className="field-label" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />

      <label className="field-label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error ? <p className="error-text">{error}</p> : null}

      <button className="login-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in to editor"}
      </button>
    </form>
  );
}
