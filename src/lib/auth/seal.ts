import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto";
import { pepper } from "./pin";

const ivLength = 12;
const tagLength = 16;

function sealKey() {
  return Buffer.from(hkdfSync("sha256", pepper(), "", "akiba-seal", 32));
}

export function seal(value: unknown) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv("aes-256-gcm", sealKey(), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);

  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function unseal<T>(token: string | undefined): T | null {
  if (!token) return null;

  try {
    const data = Buffer.from(token, "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      sealKey(),
      data.subarray(0, ivLength),
    );
    decipher.setAuthTag(data.subarray(ivLength, ivLength + tagLength));
    const body = Buffer.concat([
      decipher.update(data.subarray(ivLength + tagLength)),
      decipher.final(),
    ]);

    return JSON.parse(body.toString("utf8")) as T;
  } catch {
    return null;
  }
}
