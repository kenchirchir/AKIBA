"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";
import type { AdminFormState } from "./errors";
import {
  adminFieldErrors,
  adminLoginSchema,
  rejectionSchema,
  verificationSchema,
} from "./validation";

const failed: AdminFormState = { errors: { form: "generic" } };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function revalidateTailor(tailorId: string) {
  const { supabase } = await requireAdmin();
  const { data: garments } = await supabase
    .from("garments")
    .select("id")
    .eq("tailor_id", tailorId);

  revalidatePath("/admin", "layout");
  revalidatePath(`/tailors/${tailorId}`);
  revalidatePath("/");
  for (const garment of garments ?? []) {
    revalidatePath(`/garments/${garment.id}`);
  }
}

export async function adminLogIn(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = adminLoginSchema.safeParse({
    email: text(formData, "email").trim(),
    password: text(formData, "password"),
  });

  if (!parsed.success) return { errors: adminFieldErrors(parsed.error) };

  const supabase = await createServerSupabase({ remember: false });
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { errors: { form: "wrongLogin" } };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut({ scope: "local" });
    return { errors: { form: "notAdmin" } };
  }

  redirect("/admin");
}

export async function verifyTailor(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const parsed = verificationSchema.safeParse({
    tailorId: text(formData, "tailorId"),
    association: text(formData, "association"),
    official: text(formData, "official"),
    visitDate: text(formData, "visitDate"),
    consent: text(formData, "consent"),
    notes: text(formData, "notes"),
  });

  if (!parsed.success) return { errors: adminFieldErrors(parsed.error) };

  const { tailorId, association, official, visitDate, notes } = parsed.data;
  const { error } = await supabase.rpc("admin_verify_tailor", {
    tailor: tailorId,
    association_name: association,
    official,
    visited: visitDate,
    consent: true,
    note: notes ?? "",
  });

  if (error) return failed;

  await revalidateTailor(tailorId);
  redirect(`/admin/tailors/${tailorId}?verified=1`, RedirectType.replace);
}

export async function setTailorStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const tailorId = text(formData, "tailorId");
  const status = text(formData, "status");
  if (!z.uuid().safeParse(tailorId).success) return;
  if (status !== "pending" && status !== "suspended") return;

  await supabase.rpc("admin_set_tailor_status", {
    tailor: tailorId,
    new_status: status,
  });
  await revalidateTailor(tailorId);
  redirect(`/admin/tailors/${tailorId}?${status}=1`, RedirectType.replace);
}

export async function approveGarment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const garmentId = text(formData, "garmentId");
  if (!z.uuid().safeParse(garmentId).success) return;

  const { data } = await supabase
    .from("garments")
    .select("tailor_id")
    .eq("id", garmentId)
    .maybeSingle();
  if (!data) return;

  await supabase.rpc("admin_review_garment", {
    garment: garmentId,
    approve: true,
    reason: "",
  });
  await revalidateTailor(data.tailor_id);
  redirect("/admin/garments?approved=1", RedirectType.replace);
}

export async function rejectGarment(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const parsed = rejectionSchema.safeParse({
    garmentId: text(formData, "garmentId"),
    reason: text(formData, "reason"),
    note: text(formData, "note"),
  });

  if (!parsed.success) return { errors: adminFieldErrors(parsed.error) };

  const { garmentId, reason, note } = parsed.data;
  const t = await getTranslations("Admin.reasons");
  const message = [reason === "other" ? "" : t(reason), note]
    .filter(Boolean)
    .join(" ");

  const { error } = await supabase.rpc("admin_review_garment", {
    garment: garmentId,
    approve: false,
    reason: message,
  });

  if (error) return failed;

  revalidatePath("/admin", "layout");
  redirect("/admin/garments?rejected=1", RedirectType.replace);
}
