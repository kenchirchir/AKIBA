import { cookies } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const eventSchema = z.object({
  type: z.enum(["story_view", "story_read", "save", "unsave"]),
  garmentId: z.uuid(),
  seconds: z.number().int().min(1).max(3600).optional(),
});

type UsageEvent = z.infer<typeof eventSchema>;

const visitorCookie = "akiba_visitor";
const oneYear = 60 * 60 * 24 * 365;
const repeatViewMinutes = 30;
const robots = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

async function signedInUser() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

async function record(
  event: UsageEvent,
  visitorId: string,
  userId: string | null,
) {
  if (event.type === "story_read" && !event.seconds) return;

  const supabase = createAdminClient();
  const { data: garment } = await supabase
    .from("garments")
    .select("id, tailor_id, tailors(profile_id)")
    .eq("id", event.garmentId)
    .eq("status", "approved")
    .maybeSingle();

  if (!garment || garment.tailors?.profile_id === userId) return;

  if (event.type === "story_view") {
    const since = new Date(Date.now() - repeatViewMinutes * 60_000);
    const { count } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "story_view")
      .eq("garment_id", garment.id)
      .eq("visitor_id", visitorId)
      .gte("created_at", since.toISOString());
    if (count) return;
  }

  const { error } = await supabase.from("analytics_events").insert({
    event_type: event.type,
    garment_id: garment.id,
    tailor_id: garment.tailor_id,
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
