import "server-only";
import { createHmac } from "node:crypto";

export function pepper() {
  const value = process.env.AUTH_PIN_PEPPER;

  if (!value) {
    throw new Error(
      "AUTH_PIN_PEPPER is missing. Add it to .env.local and to Vercel.",
    );
  }

  return value;
}

export function pinToPassword(phone: string, pin: string) {
  return createHmac("sha256", pepper())
    .update(`${phone}:${pin}`)
    .digest("base64url");
}
