import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
  );
  process.exit(1);
}

const visitor = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const pendingGarmentId = "00000000-0000-4000-8000-000000000209";
const unverifiedTailorId = "00000000-0000-4000-8000-000000000105";
const sampleGarment = {
  tailor_id: "00000000-0000-4000-8000-000000000101",
  name: "Security test garment",
  category: "dresses",
  story: "This garment must never be saved by a visitor.",
  price_rwf: 1000,
};

const blocked = ({ data, error }) => Boolean(error) || data.length === 0;

const checks = [
  [
    "Visitors can read approved garments",
    async () => {
      const { data, error } = await visitor.from("garments").select("id");
      return !error && data.length > 0;
    },
  ],
  [
    "Visitors cannot see garments waiting for review",
    async () =>
      blocked(
        await visitor.from("garments").select("id").eq("id", pendingGarmentId),
      ),
  ],
  [
    "Visitors cannot see tailors who are not verified",
    async () =>
      blocked(
        await visitor.from("tailors").select("id").eq("id", unverifiedTailorId),
      ),
  ],
  [
    "Visitors cannot see garments from tailors who are not verified",
    async () =>
      blocked(
        await visitor
          .from("garments")
          .select("id")
          .eq("tailor_id", unverifiedTailorId),
      ),
  ],
  [
    "Visitors cannot read buyer requests",
    async () => blocked(await visitor.from("requests").select("id")),
  ],
  [
    "Visitors cannot read usage logs",
    async () => blocked(await visitor.from("analytics_events").select("id")),
  ],
  [
    "Visitors cannot read account profiles",
    async () => blocked(await visitor.from("profiles").select("id")),
  ],
  [
    "Visitors cannot read verification records",
    async () =>
      blocked(await visitor.from("tailor_verifications").select("tailor_id")),
  ],
  [
    "Visitors cannot add garments",
    async () => {
      const { error } = await visitor.from("garments").insert(sampleGarment);
      return Boolean(error);
    },
  ],
  [
    "Visitors cannot change garments",
    async () =>
      blocked(
        await visitor
          .from("garments")
          .update({ name: "Changed by a visitor" })
          .eq("status", "approved")
          .select("id"),
      ),
  ],
  [
    "Visitors cannot delete garments",
    async () =>
      blocked(
        await visitor
          .from("garments")
          .delete()
          .eq("status", "approved")
          .select("id"),
      ),
  ],
  [
    "Visitors cannot send requests straight to the database",
    async () => {
      const { error } = await visitor.from("requests").insert({
        tailor_id: sampleGarment.tailor_id,
        buyer_name: "Test buyer",
        buyer_phone: "0780000000",
        size: "M",
      });
      return Boolean(error);
    },
  ],
];

let failures = 0;

for (const [name, run] of checks) {
  let passed = false;
  try {
    passed = await run();
  } catch {
    passed = false;
  }
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}`);
}

console.log(
  failures === 0
    ? `\nAll ${checks.length} security checks passed.`
    : `\n${failures} of ${checks.length} security checks failed.`,
);
process.exit(failures === 0 ? 0 : 1);
