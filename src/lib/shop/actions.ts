"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import {
  destroyPhotos,
  ownsPhoto,
  photoFolder,
  signedPhotoUpload,
} from "@/lib/cloudinary";
import { maxPhotos, type Photo } from "@/lib/photos";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentTailor } from "@/lib/tailor";
import type { GarmentFormState } from "./errors";
import { garmentFieldErrors, garmentSchema } from "./validation";

type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;

const failed: GarmentFormState = { errors: { form: "generic" } };
const missing: GarmentFormState = { errors: { form: "notFound" } };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isId(value: string) {
  return z.uuid().safeParse(value).success;
}

function savePhotos(supabase: Supabase, garmentId: string, photos: Photo[]) {
  return supabase.from("garment_photos").insert(
    photos.map((photo, position) => ({
      garment_id: garmentId,
      public_id: photo.publicId,
      width: photo.width,
      height: photo.height,
      position,
    })),
  );
}

function backToShop(
  notice: "uploaded" | "saved" | "deleted",
  changed?: { garmentId: string; tailorId: string },
): never {
  revalidatePath("/shop", "layout");
  if (changed) {
    revalidatePath(`/garments/${changed.garmentId}`);
    revalidatePath(`/tailors/${changed.tailorId}`);
    revalidatePath("/");
  }
  redirect(`/shop?${notice}=1`, RedirectType.replace);
}

export async function signPhotoUploads(count: number) {
  const tailor = await getCurrentTailor();
  if (!tailor) return [];

  const total = Math.min(
    Math.max(Math.trunc(Number(count)) || 1, 1),
    maxPhotos,
  );
  return Array.from({ length: total }, () =>
    signedPhotoUpload(photoFolder(tailor.id)),
  );
}

export async function discardPhoto(publicId: string) {
  const tailor = await getCurrentTailor();
  if (!tailor || typeof publicId !== "string") return;
  if (!ownsPhoto(tailor.id, publicId)) return;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("garment_photos")
    .select("id")
    .eq("public_id", publicId)
    .limit(1);

  if (data?.length === 0) after(() => destroyPhotos([publicId]));
}

export async function saveGarment(
  _state: GarmentFormState,
  formData: FormData,
): Promise<GarmentFormState> {
  const tailor = await getCurrentTailor();
  if (!tailor) redirect("/login");

  const id = text(formData, "id");
  if (id && !isId(id)) return missing;

  const parsed = garmentSchema.safeParse({
    photos: text(formData, "photos"),
    name: text(formData, "name"),
    category: text(formData, "category"),
    material: text(formData, "material"),
    audience: text(formData, "audience"),
    description: text(formData, "description"),
    story: text(formData, "story"),
    price: text(formData, "price"),
    makingDays: text(formData, "makingDays"),
  });

  if (!parsed.success) return { errors: garmentFieldErrors(parsed.error) };

  const { photos, category, price, makingDays, ...details } = parsed.data;
  if (!photos.every((photo) => ownsPhoto(tailor.id, photo.publicId))) {
    return failed;
  }

  const garment = {
    ...details,
    ...category,
    price_rwf: price,
    making_days: makingDays,
  };
  const supabase = await createServerSupabase();

  if (id) {
    const { data: existing } = await supabase
      .from("garments")
      .select("garment_photos(public_id)")
      .eq("id", id)
      .eq("tailor_id", tailor.id)
      .maybeSingle();
    if (!existing) return missing;

    const { error } = await supabase
      .from("garments")
      .update(garment)
      .eq("id", id);
    if (error) return failed;

    const { error: clearError } = await supabase
      .from("garment_photos")
      .delete()
      .eq("garment_id", id);
    if (clearError) return failed;

    const { error: photoError } = await savePhotos(supabase, id, photos);
    if (photoError) return failed;

    const kept = new Set(photos.map((photo) => photo.publicId));
    const removed = existing.garment_photos
      .map((photo) => photo.public_id)
      .filter((publicId) => !kept.has(publicId));
    after(() => destroyPhotos(removed));
    backToShop("saved", { garmentId: id, tailorId: tailor.id });
  }

  const { data: created, error } = await supabase
    .from("garments")
    .insert({ ...garment, tailor_id: tailor.id })
    .select("id")
    .single();
  if (error || !created) return failed;

  const { error: photoError } = await savePhotos(supabase, created.id, photos);
  if (photoError) {
    await supabase.from("garments").delete().eq("id", created.id);
    return failed;
  }

  backToShop("uploaded");
}

export async function deleteGarment(
  _state: GarmentFormState,
  formData: FormData,
): Promise<GarmentFormState> {
  const tailor = await getCurrentTailor();
  if (!tailor) redirect("/login");

  const id = text(formData, "id");
  if (!isId(id)) return missing;

  const supabase = await createServerSupabase();
  const { data: garment } = await supabase
    .from("garments")
    .select("garment_photos(public_id)")
    .eq("id", id)
    .eq("tailor_id", tailor.id)
    .maybeSingle();
  if (!garment) return missing;

  const { error } = await supabase.from("garments").delete().eq("id", id);
  if (error) return failed;

  const removed = garment.garment_photos.map((photo) => photo.public_id);
  after(() => destroyPhotos(removed));
  backToShop("deleted", { garmentId: id, tailorId: tailor.id });
}
