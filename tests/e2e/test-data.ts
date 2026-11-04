import { createHmac, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const verifiedPhone = "+250780000903";
export const pendingPhone = "+250780000904";
export const adminPhone = "+250780000906";
export const shopName = "E2E Test Couture";
export const pendingShopName = "E2E Pending Shop";
export const garmentName = "E2E kitenge wrap dress";
export const buyerName = "E2E Waiting Buyer";

export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function testPin() {
  let pin = "";
  while (new Set(pin).size < 4) pin = String(randomInt(10000, 99999));
  return pin;
}

export function pinPassword(phone: string, pin: string) {
  return createHmac("sha256", process.env.AUTH_PIN_PEPPER!)
    .update(`${phone}:${pin}`)
    .digest("base64url");
}

export async function removeTestData() {
  const admin = adminClient();
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const phones = [verifiedPhone, pendingPhone, adminPhone].map((phone) =>
    phone.slice(1),
  );

  for (const user of data?.users ?? []) {
    if (!user.phone || !phones.includes(user.phone)) continue;

    const { data: shop } = await admin
      .from("tailors")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (shop) {
      await admin.from("analytics_events").delete().eq("tailor_id", shop.id);
    }
    await admin.auth.admin.deleteUser(user.id);
  }

  await admin
    .from("pin_attempts")
    .delete()
    .in("phone", [verifiedPhone, pendingPhone, adminPhone]);
}
