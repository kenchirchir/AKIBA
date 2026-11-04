import {
  adminClient,
  adminPhone,
  buyerName,
  garmentName,
  pendingPhone,
  pendingShopName,
  pinPassword,
  removeTestData,
  shopName,
  testPin,
  verifiedPhone,
} from "./test-data";

async function createShop(phone: string, name: string, status: string) {
  const admin = adminClient();
  const pin = testPin();
  const { data, error } = await admin.auth.admin.createUser({
    phone,
    password: pinPassword(phone, pin),
    phone_confirm: true,
  });
  if (error) throw error;

  const { data: shop, error: shopError } = await admin
    .from("tailors")
    .insert({
      profile_id: data.user.id,
      owner_name: "Aline Test",
      shop_name: name,
      district: "gasabo",
      sector: "kimironko",
      shop_address: "Kimironko Market, stall 42",
      tailoring_types: ["dressmaking", "kitenge-ankara"],
      tailoring_since: "2017-07-01",
      status,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (shopError) throw shopError;

  return { id: shop.id, pin };
}

async function createAdmin() {
  const admin = adminClient();
  const pin = testPin();
  const { data, error } = await admin.auth.admin.createUser({
    phone: adminPhone,
    password: pinPassword(adminPhone, pin),
    phone_confirm: true,
  });
  if (error) throw error;

  const { error: roleError } = await admin
    .from("profiles")
    .upsert({ id: data.user.id, role: "admin" });
  if (roleError) throw roleError;

  return pin;
}

export default async function globalSetup() {
  await removeTestData();

  const admin = adminClient();
  const verified = await createShop(verifiedPhone, shopName, "verified");
  const pending = await createShop(pendingPhone, pendingShopName, "pending");

  const { data: garment, error } = await admin
    .from("garments")
    .insert({
      tailor_id: verified.id,
      name: garmentName,
      category: "dresses",
      audience: "women",
      price_rwf: 31500,
      making_days: 5,
      story: "A test story for the automated journey tests.",
      status: "approved",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: requestError } = await admin.from("requests").insert({
    garment_id: garment.id,
    tailor_id: verified.id,
    buyer_name: buyerName,
    buyer_phone: "+250780000129",
    size: "m",
    quantity: 1,
    needed_by: "2026-12-01",
    best_time: "afternoon",
  });
  if (requestError) throw requestError;

  process.env.E2E_TAILOR_ID = verified.id;
  process.env.E2E_TAILOR_PIN = verified.pin;
  process.env.E2E_PENDING_TAILOR_ID = pending.id;
  process.env.E2E_GARMENT_ID = garment.id;
  process.env.E2E_ADMIN_PIN = await createAdmin();
}
