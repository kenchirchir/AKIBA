import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
  );
  process.exit(1);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const visitor = createClient(url, key, options);

const pendingGarmentId = "00000000-0000-4000-8000-000000000209";
const unverifiedTailorId = "00000000-0000-4000-8000-000000000105";
const sampleGarment = {
  tailor_id: "00000000-0000-4000-8000-000000000101",
  name: "Security test garment",
  category: "dresses",
  story: "This garment must never be saved by a visitor.",
  price_rwf: 1000,
};
const testPhones = ["+250780000901", "+250780000902"];
const testAdminEmail = "security-check-admin@example.com";
const testCode = "security-check";

const blocked = ({ data, error }) => Boolean(error) || data.length === 0;
const denied = ({ error }) => error?.code === "42501";

const visitorChecks = [
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
    "Visitors cannot read the PIN lockout list",
    async () => blocked(await visitor.from("pin_attempts").select("phone")),
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
    "Visitors cannot count story views",
    async () => denied(await visitor.rpc("my_garment_views")),
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

function testShop(profileId, name) {
  return {
    profile_id: profileId,
    owner_name: name,
    shop_name: name,
    district: "gasabo",
    sector: "remera",
    shop_address: "Security test address",
    tailoring_types: ["dressmaking"],
    tailoring_since: "2020-01-01",
  };
}

function testGarment(tailorId) {
  return {
    tailor_id: tailorId,
    name: "Security test garment",
    category: "dresses",
    story: "This garment only exists while the security checks run.",
    price_rwf: 1000,
  };
}

function testPhoto(garmentId, position) {
  return {
    garment_id: garmentId,
    public_id: `akiba/garments/security-check/${garmentId}-${position}`,
    width: 1200,
    height: 1600,
    position,
  };
}

function testView(garmentId) {
  return {
    event_type: "story_view",
    garment_id: garmentId,
    participant_code: testCode,
  };
}

async function removeTestUsers(admin) {
  await admin
    .from("analytics_events")
    .delete()
    .eq("participant_code", testCode);

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  const phones = testPhones.map((phone) => phone.slice(1));
  for (const user of data.users) {
    if (phones.includes(user.phone) || user.email === testAdminEmail) {
      await admin.auth.admin.deleteUser(user.id);
    }
  }
}

async function signedInUser(admin, phone) {
  const password = randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    phone,
    password,
    phone_confirm: true,
  });
  if (error) throw error;

  const client = createClient(url, key, options);
  const { error: signInError } = await client.auth.signInWithPassword({
    phone,
    password,
  });
  if (signInError) throw signInError;

  return { client, userId: data.user.id };
}

async function signedInAdmin(admin) {
  const password = randomUUID();
  const { data, error } = await admin.auth.admin.createUser({
    email: testAdminEmail,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", data.user.id);
  if (roleError) throw roleError;

  const client = createClient(url, key, options);
  const { error: signInError } = await client.auth.signInWithPassword({
    email: testAdminEmail,
    password,
  });
  if (signInError) throw signInError;

  return client;
}

async function setUp(admin) {
  await removeTestUsers(admin);

  const a = await signedInUser(admin, testPhones[0]);
  const b = await signedInUser(admin, testPhones[1]);

  const { data: shopB, error: shopError } = await b.client
    .from("tailors")
    .insert(testShop(b.userId, "Security test shop B"))
    .select("id")
    .single();
  if (shopError) throw shopError;

  const { data: garmentB, error: garmentError } = await b.client
    .from("garments")
    .insert(testGarment(shopB.id))
    .select("id")
    .single();
  if (garmentError) throw garmentError;

  const { error: requestError } = await admin.from("requests").insert({
    tailor_id: shopB.id,
    buyer_name: "Test buyer",
    buyer_phone: "0780000000",
    size: "M",
  });
  if (requestError) throw requestError;

  const researcher = await signedInAdmin(admin);

  return { admin, a, b, researcher, shopB: shopB.id, garmentB: garmentB.id };
}

function tailorChecks({ admin, a, b, researcher, shopB, garmentB }) {
  const own = {};

  return [
    [
      "Tailors can create their own shop",
      async () => {
        const { data, error } = await a.client
          .from("tailors")
          .insert(testShop(a.userId, "Security test shop A"))
          .select("id, status")
          .single();
        if (error) return false;
        own.shop = data;
        return true;
      },
    ],
    [
      "New shops wait for verification",
      async () => own.shop?.status === "pending",
    ],
    [
      "Tailors cannot create a shop for someone else",
      async () =>
        denied(
          await a.client
            .from("tailors")
            .insert(testShop(b.userId, "Shop for someone else")),
        ),
    ],
    [
      "Tailors cannot verify their own shop",
      async () =>
        denied(
          await a.client
            .from("tailors")
            .update({ status: "verified" })
            .eq("id", own.shop.id),
        ),
    ],
    [
      "Tailors can edit their own shop details",
      async () => {
        const { data, error } = await a.client
          .from("tailors")
          .update({ shop_name: "Security test shop A, edited" })
          .eq("id", own.shop.id)
          .select("id");
        return !error && data.length === 1;
      },
    ],
    [
      "Tailors cannot edit another tailor's shop",
      async () =>
        blocked(
          await a.client
            .from("tailors")
            .update({ shop_name: "Changed by another tailor" })
            .eq("id", shopB)
            .select("id"),
        ),
    ],
    [
      "Tailors cannot see other shops waiting for verification",
      async () =>
        blocked(await a.client.from("tailors").select("id").eq("id", shopB)),
    ],
    [
      "New garments wait for review",
      async () => {
        const { data, error } = await a.client
          .from("garments")
          .insert(testGarment(own.shop.id))
          .select("id, status")
          .single();
        if (error) return false;
        own.garment = data;
        return data.status === "pending";
      },
    ],
    [
      "Tailors cannot publish garments without review",
      async () =>
        denied(
          await a.client
            .from("garments")
            .insert({ ...testGarment(own.shop.id), status: "approved" }),
        ),
    ],
    [
      "Tailors cannot approve their own garments",
      async () =>
        denied(
          await a.client
            .from("garments")
            .update({ status: "approved" })
            .eq("id", own.garment.id),
        ),
    ],
    [
      "Tailors cannot add garments to another tailor's shop",
      async () =>
        denied(await a.client.from("garments").insert(testGarment(shopB))),
    ],
    [
      "Tailors cannot see garments waiting for review in other shops",
      async () =>
        blocked(
          await a.client
            .from("garments")
            .select("id")
            .eq("id", pendingGarmentId),
        ),
    ],
    [
      "Tailors can add photos to their own garments",
      async () => {
        const { error } = await a.client
          .from("garment_photos")
          .insert(testPhoto(own.garment.id, 0));
        return !error;
      },
    ],
    [
      "Tailors cannot add photos to another tailor's garments",
      async () =>
        denied(
          await a.client.from("garment_photos").insert(testPhoto(garmentB, 0)),
        ),
    ],
    [
      "Visitors cannot see photos of garments waiting for review",
      async () =>
        blocked(
          await visitor
            .from("garment_photos")
            .select("id")
            .eq("garment_id", own.garment.id),
        ),
    ],
    [
      "Changing the photos of a live garment sends it back for review",
      async () => {
        const { error: approveError } = await admin
          .from("garments")
          .update({
            status: "approved",
            published_at: new Date().toISOString(),
          })
          .eq("id", own.garment.id);
        if (approveError) return false;

        const { error: photoError } = await a.client
          .from("garment_photos")
          .insert(testPhoto(own.garment.id, 1));
        if (photoError) return false;

        const { data } = await admin
          .from("garments")
          .select("status, published_at")
          .eq("id", own.garment.id)
          .single();
        return data?.status === "pending" && data.published_at === null;
      },
    ],
    [
      "Tailors can see their own shop while it waits for verification",
      async () => {
        const { data, error } = await a.client
          .from("tailors")
          .select("id")
          .eq("id", own.shop.id);
        return !error && data.length === 1;
      },
    ],
    [
      "Visitors can see a verified tailor and their approved garments",
      async () => {
        const { error: approveError } = await admin
          .from("garments")
          .update({
            status: "approved",
            published_at: new Date().toISOString(),
          })
          .eq("id", own.garment.id);
        const { error: verifyError } = await admin
          .from("tailors")
          .update({ status: "verified", verified_at: new Date().toISOString() })
          .eq("id", own.shop.id);
        if (approveError || verifyError) return false;

        const tailors = await visitor
          .from("tailors")
          .select("id")
          .eq("id", own.shop.id);
        const garments = await visitor
          .from("garments")
          .select("id")
          .eq("tailor_id", own.shop.id);
        return tailors.data?.length === 1 && garments.data?.length === 1;
      },
    ],
    [
      "Visitors cannot see a suspended tailor or their garments",
      async () => {
        const { error } = await admin
          .from("tailors")
          .update({ status: "suspended" })
          .eq("id", own.shop.id);
        if (error) return false;

        return (
          blocked(
            await visitor.from("tailors").select("id").eq("id", own.shop.id),
          ) &&
          blocked(
            await visitor
              .from("garments")
              .select("id")
              .eq("tailor_id", own.shop.id),
          )
        );
      },
    ],
    [
      "Tailors only see story views of their own garments",
      async () => {
        const { error: viewError } = await admin
          .from("analytics_events")
          .insert([testView(own.garment.id), testView(garmentB)]);
        if (viewError) return false;

        const { data, error } = await a.client.rpc("my_garment_views");
        return (
          !error &&
          data.length === 1 &&
          data[0].garment_id === own.garment.id &&
          data[0].views === 1
        );
      },
    ],
    [
      "Tailors cannot read usage logs",
      async () => blocked(await a.client.from("analytics_events").select("id")),
    ],
    [
      "Tailors can read requests sent to their shop",
      async () => {
        const { data, error } = await b.client.from("requests").select("id");
        return !error && data.length === 1;
      },
    ],
    [
      "Tailors cannot read requests sent to other shops",
      async () => blocked(await a.client.from("requests").select("id")),
    ],
    [
      "Tailors can mark a request to their shop as ordered",
      async () => {
        const { data, error } = await b.client
          .from("requests")
          .update({ status: "ordered", ordered_at: new Date().toISOString() })
          .eq("tailor_id", shopB)
          .select("id, status");
        return !error && data.length === 1 && data[0].status === "ordered";
      },
    ],
    [
      "Tailors cannot change the buyer's details on a request",
      async () =>
        denied(
          await b.client
            .from("requests")
            .update({ buyer_phone: "0780000999" })
            .eq("tailor_id", shopB),
        ),
    ],
    [
      "Tailors cannot change requests sent to other shops",
      async () =>
        blocked(
          await a.client
            .from("requests")
            .update({ status: "read" })
            .eq("tailor_id", shopB)
            .select("id"),
        ),
    ],
    [
      "Tailors cannot delete requests",
      async () =>
        denied(await b.client.from("requests").delete().eq("tailor_id", shopB)),
    ],
    [
      "Tailors only see their own account details",
      async () => {
        const { data, error } = await a.client.from("profiles").select("id");
        return !error && data.length === 1 && data[0].id === a.userId;
      },
    ],
    [
      "Tailors cannot make themselves admins",
      async () =>
        denied(
          await a.client
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", a.userId),
        ),
    ],
    [
      "Tailors cannot read the PIN lockout list",
      async () => blocked(await a.client.from("pin_attempts").select("phone")),
    ],
    [
      "Tailors cannot read verification records",
      async () =>
        blocked(
          await a.client.from("tailor_verifications").select("tailor_id"),
        ),
    ],
    [
      "The admin can see shops waiting for verification",
      async () => {
        const { data, error } = await researcher
          .from("tailors")
          .select("id")
          .eq("id", unverifiedTailorId);
        return !error && data.length === 1;
      },
    ],
    [
      "The admin can see garments waiting for review",
      async () => {
        const { data, error } = await researcher
          .from("garments")
          .select("id")
          .eq("id", pendingGarmentId);
        return !error && data.length === 1;
      },
    ],
    [
      "The admin cannot read buyer requests",
      async () => blocked(await researcher.from("requests").select("id")),
    ],
    [
      "The admin cannot verify a tailor without their consent",
      async () => {
        const { error } = await researcher.rpc("admin_verify_tailor", {
          tailor: own.shop.id,
          association_name: "Security check association",
          official: "Security check official",
          visited: "2026-01-01",
          consent: false,
          note: "",
        });
        return Boolean(error);
      },
    ],
    [
      "The admin can verify a tailor and read the verification record",
      async () => {
        const { error } = await researcher.rpc("admin_verify_tailor", {
          tailor: own.shop.id,
          association_name: "Security check association",
          official: "Security check official",
          visited: "2026-01-01",
          consent: true,
          note: "",
        });
        if (error) return false;

        const [shop, record] = await Promise.all([
          admin.from("tailors").select("status").eq("id", own.shop.id).single(),
          researcher
            .from("tailor_verifications")
            .select("tailor_id")
            .eq("tailor_id", own.shop.id),
        ]);
        return shop.data?.status === "verified" && record.data?.length === 1;
      },
    ],
    [
      "The admin can approve and reject garments",
      async () => {
        const approve = await researcher.rpc("admin_review_garment", {
          garment: own.garment.id,
          approve: true,
          reason: "",
        });
        const approved = await admin
          .from("garments")
          .select("status, published_at")
          .eq("id", own.garment.id)
          .single();
        const reject = await researcher.rpc("admin_review_garment", {
          garment: own.garment.id,
          approve: false,
          reason: "Security check reason",
        });
        const rejected = await admin
          .from("garments")
          .select("status, rejection_reason")
          .eq("id", own.garment.id)
          .single();
        return (
          !approve.error &&
          !reject.error &&
          approved.data?.status === "approved" &&
          Boolean(approved.data.published_at) &&
          rejected.data?.status === "rejected" &&
          rejected.data.rejection_reason === "Security check reason"
        );
      },
    ],
    [
      "The admin can read the research report",
      async () => {
        const results = await Promise.all([
          researcher.rpc("admin_report_summary"),
          researcher.rpc("admin_garment_report"),
          researcher.rpc("admin_participant_report"),
        ]);
        return results.every(({ error }) => !error);
      },
    ],
    [
      "Tailors cannot use the admin functions",
      async () => {
        const verify = await a.client.rpc("admin_verify_tailor", {
          tailor: own.shop.id,
          association_name: "Not the admin",
          official: "Not the admin",
          visited: "2026-01-01",
          consent: true,
          note: "",
        });
        const review = await a.client.rpc("admin_review_garment", {
          garment: own.garment.id,
          approve: true,
          reason: "",
        });
        return Boolean(verify.error) && Boolean(review.error);
      },
    ],
    [
      "Tailors cannot read the research report",
      async () => Boolean((await a.client.rpc("admin_report_summary")).error),
    ],
    [
      "Visitors cannot read the research report",
      async () => Boolean((await visitor.rpc("admin_garment_report")).error),
    ],
    [
      "Tailors can turn their own SMS alerts off",
      async () => {
        const { data, error } = await a.client
          .from("tailors")
          .update({ sms_alerts: false })
          .eq("id", own.shop.id)
          .select("sms_alerts");
        return !error && data.length === 1 && data[0].sms_alerts === false;
      },
    ],
    [
      "Deleting an account removes the shop, its garments and its requests",
      async () => {
        const { error } = await admin.auth.admin.deleteUser(b.userId);
        if (error) return false;

        const [shops, garments, requests] = await Promise.all([
          admin.from("tailors").select("id").eq("id", shopB),
          admin.from("garments").select("id").eq("tailor_id", shopB),
          admin.from("requests").select("id").eq("tailor_id", shopB),
        ]);
        return [shops, garments, requests].every(
          ({ data, error: readError }) => !readError && data.length === 0,
        );
      },
    ],
  ];
}

async function run(checks) {
  let failures = 0;

  for (const [name, check] of checks) {
    let passed = false;
    try {
      passed = await check();
    } catch {
      passed = false;
    }
    if (!passed) failures += 1;
    console.log(`${passed ? "PASS" : "FAIL"}  ${name}`);
  }

  return failures;
}

console.log("Visitors\n");
let total = visitorChecks.length;
let failures = await run(visitorChecks);

console.log("\nSigned-in tailors\n");

if (!secretKey) {
  console.log(
    "SKIP  Add SUPABASE_SECRET_KEY to .env.local to run the signed-in tailor checks.",
  );
  total += 1;
  failures += 1;
} else {
  const admin = createClient(url, secretKey, options);
  try {
    const checks = tailorChecks(await setUp(admin));
    total += checks.length;
    failures += await run(checks);
  } catch (error) {
    console.log(`FAIL  Could not create the test tailors: ${error.message}`);
    total += 1;
    failures += 1;
  } finally {
    await removeTestUsers(admin);
  }
}

console.log(
  failures === 0
    ? `\nAll ${total} security checks passed.`
    : `\n${failures} of ${total} security checks failed.`,
);
process.exit(failures === 0 ? 0 : 1);
