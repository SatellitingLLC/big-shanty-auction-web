import { NextResponse } from "next/server";

import {
  createSessionToken,
  isAuthConfigurationValid,
  isSameOriginRequest,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  if (!isAuthConfigurationValid()) {
    console.error("Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and SESSION_SECRET.");
    return NextResponse.json({ message: "Admin login is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  if (!verifyAdminCredentials(body.email, body.password)) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), sessionCookieOptions());
  return response;
}
