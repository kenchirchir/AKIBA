import "server-only";
import { z } from "zod";
import { requireAdmin } from "./auth";
import type { TailorStatus } from "./options";

export async function getOverview() {
  const { supabase } = await requireAdmin();
  const count = (table: "tailors" | "garments", status: string) =>
    supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("status", status)
      .then(({ count: total }) => total ?? 0);

  const [pendingTailors, verifiedTailors, suspendedTailors, pendingGarments] =
    await Promise.all([
      count("tailors", "pending"),
      count("tailors", "verified"),
      count("tailors", "suspended"),
      count("garments", "pending"),
    ]);

  return { pendingTailors, verifiedTailors, suspendedTailors, pendingGarments };
}

export async function getAdminTailors(status: TailorStatus) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("tailors")
    .select(
      "id, shop_name, owner_name, district, sector, status, is_sample, created_at, profiles(phone), garments(count)",
    )
    .eq("status", status)
    .order("created_at", { ascending: status !== "verified" });

  if (error) throw new Error(`Could not load tailors: ${error.message}`);

  return data.map(({ garments, ...tailor }) => ({
    ...tailor,
    garmentCount: garments[0]?.count ?? 0,
  }));
}

export async function getAdminTailor(id: string) {
  if (!z.uuid().safeParse(id).success) return null;

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("tailors")
    .select(
      "id, shop_name, owner_name, district, sector, shop_address, tailoring_types, tailoring_since, about, avatar_public_id, status, verified_at, is_sample, created_at, profiles(phone), tailor_verifications(association, official_name, visit_date, consent_given, notes), garments(id, name, status)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load the tailor: ${error.message}`);
  return data;
}

export type AdminTailor = NonNullable<
  Awaited<ReturnType<typeof getAdminTailor>>
>;

export async function getPendingGarments() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("garments")
    .select(
      "id, name, category, subcategory, material, audience, description, story, price_rwf, making_days, updated_at, tailors(id, shop_name, owner_name, status), garment_photos(public_id, width, height)",
    )
    .eq("status", "pending")
    .order("updated_at")
    .order("position", { referencedTable: "garment_photos" });

  if (error) throw new Error(`Could not load garments: ${error.message}`);
  return data;
}

export type PendingGarment = Awaited<
  ReturnType<typeof getPendingGarments>
>[number];

export async function getResearchReport() {
  const { supabase } = await requireAdmin();
  const [summary, garments, participants] = await Promise.all([
    supabase.rpc("admin_report_summary").single(),
    supabase.rpc("admin_garment_report"),
    supabase.rpc("admin_participant_report"),
  ]);

  const error = summary.error ?? garments.error ?? participants.error;
  if (error) throw new Error(`Could not load the report: ${error.message}`);

  return {
    summary: summary.data,
    garments: garments.data ?? [],
    participants: participants.data ?? [],
  };
}

export type ResearchReport = Awaited<ReturnType<typeof getResearchReport>>;
