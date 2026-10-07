import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "big-shanty-auth";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const PASSWORD_HASH_PATTERN = /^([a-f0-9]{32}):([a-f0-9]{128})$/i;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function passwordHash() {
  const match = process.env.ADMIN_PASSWORD_HASH?.match(PASSWORD_HASH_PATTERN);
  return match ? { salt: match[1], hash: Buffer.from(match[2], "hex") } : null;
}

export function isAuthConfigurationValid() {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim() &&
      passwordHash() &&
      sessionSecret(),
  );
}

export function verifyAdminCredentials(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = passwordHash();

  if (!configuredEmail || !configuredPassword) {
    return false;
  }

  const actualHash = scryptSync(password, Buffer.from(configuredPassword.salt, "hex"), 64);
  return (
    email.trim().toLowerCase() === configuredEmail &&
    timingSafeEqual(actualHash, configuredPassword.hash)
  );
}

function signSession(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken() {
  const secret = sessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  const payload = `v1.${Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS}`;
  return `${payload}.${signSession(payload, secret)}`;
}

export async function isAuthenticated() {
  const secret = sessionSecret();
  if (!secret) {
    return false;
  }

  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const match = token?.match(/^v1\.(\d{10})\.([a-f0-9]{64})$/i);
  if (!match || Number(match[1]) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const actual = Buffer.from(match[2], "hex");
  const expected = Buffer.from(signSession(`v1.${match[1]}`, secret), "hex");
  return timingSafeEqual(actual, expected);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  };
}
