
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }

  return secret;
}

function createSignature(expires: string) {
  return createHmac("sha256", getSessionSecret())
    .update(`admin:${expires}`)
    .digest("hex");
}

export async function createAdminSession() {
  const expires = String(
    Math.floor(Date.now() / 1000) + SESSION_DURATION
  );

  const signature = createSignature(expires);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${expires}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;

  if (!session) return false;

  const [expires, signature, extra] = session.split(".");

  if (!expires || !signature || extra !== undefined) return false;

  const expiryTime = Number(expires);

  if (!Number.isSafeInteger(expiryTime)) return false;
  if (expiryTime <= Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = createSignature(expires);

  const actual = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
