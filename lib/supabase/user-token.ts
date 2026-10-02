import "server-only";
import { createHmac } from "node:crypto";

export function createSupabaseUserToken(userId: string, displayName: string) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error("Thiếu SUPABASE_JWT_SECRET.");

  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsignedToken = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    aud: "authenticated",
    exp: now + 60 * 60,
    iat: now,
    name: displayName,
    role: "authenticated",
    sub: userId,
  })}`;
  const signature = createHmac("sha256", secret).update(unsignedToken).digest("base64url");

  return `${unsignedToken}.${signature}`;
}
