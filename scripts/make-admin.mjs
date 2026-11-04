import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

function rwandaPhone(input) {
  const digits = (input ?? "").replace(/\D/g, "");
  const national = digits.startsWith("250")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;

  return /^7[2389]\d{7}$/.test(national) ? `+250${national}` : null;
}

if (!url || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local",
  );
  process.exit(1);
}

const phone = rwandaPhone(process.argv[2]);
if (!phone) {
  console.error("Usage: npm run make-admin -- 0780000002");
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (error) {
  console.error(`Could not list users: ${error.message}`);
  process.exit(1);
}

let user = data.users.find((item) => item.phone === phone.slice(1));

if (!user) {
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({ phone, phone_confirm: true });
  if (createError) {
    console.error(`Could not create ${phone}: ${createError.message}`);
    process.exit(1);
  }
  user = created.user;
  console.log(`Created an account for ${phone}.`);
}

const { data: shop } = await admin
  .from("tailors")
  .select("shop_name")
  .eq("profile_id", user.id)
  .maybeSingle();

if (shop) {
  console.error(
    `${phone} already has the tailor shop "${shop.shop_name}". Use a number without a shop for the admin.`,
  );
  process.exit(1);
}

const { error: updateError } = await admin
  .from("profiles")
  .upsert({ id: user.id, role: "admin" });

if (updateError) {
  console.error(`Could not make ${phone} the admin: ${updateError.message}`);
  process.exit(1);
}

const { data: others } = await admin
  .from("profiles")
  .update({ role: "tailor" })
  .eq("role", "admin")
  .neq("id", user.id)
  .select("id");

for (const other of others ?? []) {
  const old = data.users.find((item) => item.id === other.id);
  console.log(
    `${old?.email || old?.phone || other.id} is no longer the admin. You can delete it in Supabase: Authentication, Users.`,
  );
}

console.log(`${phone} is now the AKIBA admin.`);
console.log(
  `Set the admin PIN: open /login, tap "Forgot PIN?", enter 0${phone.slice(4)}, type the SMS code and choose a PIN.`,
);
