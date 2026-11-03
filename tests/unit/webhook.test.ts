import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhook } from "@/lib/webhook-signature";

const key = Buffer.from("akiba-test-secret-key").toString("base64");
const secret = `v1,whsec_${key}`;
const body = JSON.stringify({
  user: { phone: "+250780000001" },
  sms: { otp: "123456" },
});
const now = Date.UTC(2026, 10, 3, 10, 0, 0);
const timestamp = String(now / 1000);

function signed(content: string, sentAt = timestamp) {
  const signature = createHmac("sha256", Buffer.from(key, "base64"))
    .update(`msg_1.${sentAt}.${content}`)
    .digest("base64");
  return new Headers({
    "webhook-id": "msg_1",
    "webhook-timestamp": sentAt,
    "webhook-signature": `v1,${signature}`,
  });
}

describe("Supabase SMS hook signature", () => {
  it("accepts a correctly signed request", () => {
    expect(verifyWebhook(secret, signed(body), body, now)).toBe(true);
  });

  it("refuses a request whose body was changed", () => {
    expect(
      verifyWebhook(
        secret,
        signed(body),
        body.replace("123456", "999999"),
        now,
      ),
    ).toBe(false);
  });

  it("refuses an old request", () => {
    const old = String(now / 1000 - 600);
    expect(verifyWebhook(secret, signed(body, old), body, now)).toBe(false);
  });

  it("refuses a request without signature headers", () => {
    expect(verifyWebhook(secret, new Headers(), body, now)).toBe(false);
  });
});
