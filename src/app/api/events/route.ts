import { cookies } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const eventSchema = z.union([
  z.object({
    type: z.enum(["story_view", "save", "unsave"]),
    garmentId: z.uuid(),
  }),
  z.object({
    type: z.literal("story_read"),
    garmentId: z.uuid(),
    seconds: z.number().int().min(1).max(3600),
  }),
  z.object({
    type: z.enum(["tailor_view", "directions_click"]),
    tailorId: z.uuid(),
  }),
]);

type UsageEvent = z.infer<typeof eventSchema>;
type Admin = ReturnType<typeof createAdminClient>;
type Target = { garment_id: string | null; tailor_id: string };

const visitorCookie = "akiba_visitor";
const oneYear = 60 * 60 * 24 * 365;
const repeatViewMinutes = 30;
const robots = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

async function signedInUser() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

function isOwner(profileId: string | null | undefined, userId: string | null) {
  return userId !== null && profileId === userId;
}

async function garmentTarget(
  supabase: Admin,
  garmentId: string,
  userId: string | null,
): Promise<Target | null> {
  const { data } = await supabase
    .from("garments")
    .select("id, tailor_id, tailors(profile_id)")
    .eq("id", garmentId)
    .eq("status", "approved")
    .maybeSingle();

  if (!data || isOwner(data.tailors?.profile_id, userId)) return null;
  return { garment_id: data.id, tailor_id: data.tailor_id };
}

async function tailorTarget(
  supabase: Admin,
  tailorId: string,
  userId: string | null,
): Promise<Target | null> {
  const { data } = await supabase
    .from("tailors")
    .select("id, profile_id")
    .eq("id", tailorId)
    .eq("status", "verified")
    .maybeSingle();

  if (!data || isOwner(data.profile_id, userId)) return null;
  return { garment_id: null, tailor_id: data.id };
}

async function viewedRecently(
  supabase: Admin,
  type: "story_view" | "tailor_view",
  target: Target,
  visitorId: string,
) {
  const since = new Date(Date.now() - repeatViewMinutes * 60_000);
  let request = supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", type)
    .eq("visitor_id", visitorId)
    .gte("created_at", since.toISOString());

  request = target.garment_id
    ? request.eq("garment_id", target.garment_id)
    : request.eq("tailor_id", target.tailor_id);

  const { count } = await request;
  return Boolean(count);
}

async function record(
  event: UsageEvent,
  visitorId: string,
  userId: string | null,
) {
  const supabase = createAdminClient();
  const target =
    "garmentId" in event
      ? await garmentTarget(supabase, event.garmentId, userId)
      : await tailorTarget(supabase, event.tailorId, userId);

  if (!target) return;
  if (
    (event.type === "story_view" || event.type === "tailor_view") &&
    (await viewedRecently(supabase, event.type, target, visitorId))
  ) {
    return;
  }

  const { error } = await supabase.from("analytics_events").insert({
    event_type: event.type,
    ...target,
    visitor_id: visitorId,
    duration_seconds: event.type === "story_read" ? event.seconds : null,
  });

  if (error) console.error("Could not record a usage event", error.message);
}

export async function POST(request: Request) {
  if (robots.test(request.headers.get("user-agent") ?? "")) {
    return new Response(null, { status: 204 });
  }

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });

  const jar = await cookies();
  let visitorId = jar.get(visitorCookie)?.value ?? "";

  if (!z.uuid().safeParse(visitorId).success) {
    visitorId = crypto.randomUUID();
    jar.set(visitorCookie, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: oneYear,
      path: "/",
    });
  }

  const userId = await signedInUser();
  after(() => record(parsed.data, visitorId, userId));

  return new Response(null, { status: 204 });
}
