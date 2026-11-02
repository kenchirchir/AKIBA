import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const maxWrongPins = 5;
const lockMinutes = 15;
const forgetAfterMs = 60 * 60 * 1000;

function minutesUntil(timestamp: string | null) {
  if (!timestamp) return 0;
  const remaining = new Date(timestamp).getTime() - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 60000) : 0;
}

export async function minutesLocked(phone: string) {
  const { data } = await createAdminClient()
    .from("pin_attempts")
    .select("locked_until")
    .eq("phone", phone)
    .maybeSingle();

  return minutesUntil(data?.locked_until ?? null);
}

export async function recordWrongPin(phone: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pin_attempts")
    .select("failures, updated_at")
    .eq("phone", phone)
    .maybeSingle();

  const recent =
    data && Date.now() - new Date(data.updated_at).getTime() < forgetAfterMs;
  const failures = (recent ? data.failures : 0) + 1;
  const locked = failures >= maxWrongPins;

  await admin.from("pin_attempts").upsert({
    phone,
    failures: locked ? 0 : failures,
    locked_until: locked
      ? new Date(Date.now() + lockMinutes * 60000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });

  return locked ? lockMinutes : 0;
}

export async function clearWrongPins(phone: string) {
  await createAdminClient().from("pin_attempts").delete().eq("phone", phone);
}
