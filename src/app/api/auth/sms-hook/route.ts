import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { normalizeRwandaPhone } from "@/lib/auth/phone";
import { sendSms } from "@/lib/sms";
import { verifyWebhook } from "@/lib/webhook-signature";

const hookSchema = z.object({
  user: z.object({ phone: z.string() }),
  sms: z.object({ otp: z.string().regex(/^\d{6}$/) }),
});

function failure(status: number, message: string) {
  return Response.json({ error: { http_code: status, message } }, { status });
}

export async function POST(request: Request) {
  const secret = process.env.SUPABASE_SMS_HOOK_SECRET;
  if (!secret) return failure(500, "The SMS hook is not set up.");

  const body = await request.text();
  if (!verifyWebhook(secret, request.headers, body)) {
    return failure(401, "The request could not be verified.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return failure(400, "The request is not valid JSON.");
  }

  const parsed = hookSchema.safeParse(payload);
  const phone = parsed.success
    ? normalizeRwandaPhone(parsed.data.user.phone)
    : null;
  if (!parsed.success || !phone) {
    return failure(400, "The request has no Rwandan phone number or code.");
  }

  const t = await getTranslations("Sms");
  const sent = await sendSms(phone, t("code", { code: parsed.data.sms.otp }));

  return sent ? Response.json({}) : failure(502, "The SMS could not be sent.");
}
