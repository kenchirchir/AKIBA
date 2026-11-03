import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const email = process.argv[2]?.trim().toLowerCase();

if (!url || !secretKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local",
  );
  process.exit(1);
}

if (!email || !email.includes("@")) {
  console.error("Usage: npm run make-admin -- you@example.com");
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

const user = data.users.find((item) => item.email?.toLowerCase() === email);
if (!user) {
  console.error(
    `No account with ${email}. Create it first in Supabase: Authentication, Users, Add user, with "Auto Confirm User" ticked.`,
  );
  process.exit(1);
}

const { error: updateError } = await admin
  .from("profiles")
  .upsert({ id: user.id, role: "admin" });

if (updateError) {
  console.error(`Could not make ${email} an admin: ${updateError.message}`);
  process.exit(1);
}

console.log(`${email} is now the AKIBA admin. Log in at /admin/login.`);
