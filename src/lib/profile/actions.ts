"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { after } from "next/server";
import {
  clearWrongPins,
  minutesLocked,
  recordWrongPin,
} from "@/lib/auth/lockout";
import { normalizeRwandaPhone } from "@/lib/auth/phone";
import { pinToPassword } from "@/lib/auth/pin";
import {
  destroyPhotos,
  ownsProfilePhoto,
  profilePhotoFolder,
  signedPhotoUpload,
} from "@/lib/cloudinary";
import { experienceFrom, tailoringSince } from "@/lib/experience";
import { createAdminClient } from "@/lib/supabase/admin";
import { rememberCookie } from "@/lib/supabase/cookies";
import { createPublicClient } from "@/lib/supabase/public";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentTailor } from "@/lib/tailor";
import type { ProfileFormState } from "./errors";
import {
  changePinSchema,
  confirmPinSchema,
  profileFieldErrors,
  profileSchema,
} from "./validation";

const failed: ProfileFormState = { errors: { form: "generic" } };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function signedInPhone() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.phone) return null;

  return {
    userId: data.user.id,
    phone: normalizeRwandaPhone(data.user.phone),
  };
}

async function checkPin(
  phone: string,
  pin: string,
  field: string,
): Promise<ProfileFormState | null> {
  const locked = await minutesLocked(phone);
  if (locked > 0) return { errors: { form: "locked" }, minutes: locked };

  const client = createPublicClient();
  const { error } = await client.auth.signInWithPassword({
    phone,
    password: pinToPassword(phone, pin),
  });

  if (error) {
    const lockedNow = await recordWrongPin(phone);
    return lockedNow > 0
      ? { errors: { form: "locked" }, minutes: lockedNow }
      : { errors: { [field]: "wrongPin" } };
  }

  await client.auth.signOut({ scope: "local" });
  await clearWrongPins(phone);
  return null;
}

async function revalidateShop(tailorId: string) {
  const supabase = await createServerSupabase();
  const { data: garments } = await supabase
    .from("garments")
    .select("id")
    .eq("tailor_id", tailorId);

  revalidatePath("/shop", "layout");
  revalidatePath(`/tailors/${tailorId}`);
  revalidatePath("/");
  for (const garment of garments ?? []) {
    revalidatePath(`/garments/${garment.id}`);
  }
}

export async function signProfilePhoto() {
  const tailor = await getCurrentTailor();
  if (!tailor) return null;

  return signedPhotoUpload(profilePhotoFolder(tailor.id));
}

export async function discardProfilePhoto(publicId: string) {
  const tailor = await getCurrentTailor();
  if (!tailor || typeof publicId !== "string") return;
  if (!ownsProfilePhoto(tailor.id, publicId)) return;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("tailors")
    .select("avatar_public_id, cover_public_id")
    .eq("id", tailor.id)
    .single();

  if (
    data?.avatar_public_id !== publicId &&
    data?.cover_public_id !== publicId
  ) {
    after(() => destroyPhotos([publicId]));
  }
}

export async function saveProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const tailor = await getCurrentTailor();
  if (!tailor) redirect("/login");

  const parsed = profileSchema.safeParse({
    shopName: text(formData, "shopName"),
    fullName: text(formData, "fullName"),
    years: text(formData, "years"),
    months: text(formData, "months"),
    district: text(formData, "district"),
    sector: text(formData, "sector"),
    shopAddress: text(formData, "shopAddress"),
    tailoringTypes: formData.getAll("tailoringTypes"),
    about: text(formData, "about"),
    avatar: text(formData, "avatar"),
    cover: text(formData, "cover"),
  });

  if (!parsed.success) return { errors: profileFieldErrors(parsed.error) };

  const profile = parsed.data;
  for (const photo of [profile.avatar, profile.cover]) {
    if (photo && !ownsProfilePhoto(tailor.id, photo)) {
      return { errors: { form: "photoInvalid" } };
    }
  }

  const supabase = await createServerSupabase();
  const { data: current } = await supabase
    .from("tailors")
    .select("tailoring_since, avatar_public_id, cover_public_id")
    .eq("id", tailor.id)
    .single();
  if (!current) return failed;

  const experience = current.tailoring_since
    ? experienceFrom(current.tailoring_since)
    : null;
  const unchanged =
    experience?.years === profile.years && experience.months === profile.months;

  const { error } = await supabase
    .from("tailors")
    .update({
      shop_name: profile.shopName,
      owner_name: profile.fullName,
      district: profile.district,
      sector: profile.sector,
      shop_address: profile.shopAddress,
      tailoring_types: profile.tailoringTypes,
      tailoring_since: unchanged
        ? current.tailoring_since
        : tailoringSince(profile.years, profile.months),
      about: profile.about,
      avatar_public_id: profile.avatar,
      cover_public_id: profile.cover,
    })
    .eq("id", tailor.id);

  if (error) return failed;

  await supabase.auth.updateUser({
    data: {
      fullName: null,
      district: null,
      sector: null,
      shopAddress: null,
      tailoringTypes: null,
      tailoringSince: null,
    },
  });

  const replaced = [current.avatar_public_id, current.cover_public_id].filter(
    (photo): photo is string =>
      Boolean(photo) && photo !== profile.avatar && photo !== profile.cover,
  );
  after(() => destroyPhotos(replaced));

  await revalidateShop(tailor.id);
  redirect("/shop/profile?saved=1", RedirectType.replace);
}

export async function setSmsAlerts(on: boolean) {
  const tailor = await getCurrentTailor();
  if (!tailor) return;

  const supabase = await createServerSupabase();
  await supabase
    .from("tailors")
    .update({ sms_alerts: on === true })
    .eq("id", tailor.id);
  revalidatePath("/shop/profile");
}

export async function changePin(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const account = await signedInPhone();
  if (!account?.phone) redirect("/login");

  const parsed = changePinSchema.safeParse({
    current: text(formData, "current"),
    pin: text(formData, "pin"),
    confirm: text(formData, "confirm"),
  });

  if (!parsed.success) return { errors: profileFieldErrors(parsed.error) };

  const refused = await checkPin(account.phone, parsed.data.current, "current");
  if (refused) return refused;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({
    password: pinToPassword(account.phone, parsed.data.pin),
  });

  if (error && error.code !== "same_password") return failed;

  redirect("/shop/profile?pin=1", RedirectType.replace);
}

export async function deleteAccount(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const tailor = await getCurrentTailor();
  const account = await signedInPhone();
  if (!tailor || !account?.phone) redirect("/login");

  const parsed = confirmPinSchema.safeParse({ pin: text(formData, "pin") });
  if (!parsed.success) return { errors: profileFieldErrors(parsed.error) };

  const refused = await checkPin(account.phone, parsed.data.pin, "pin");
  if (refused) return refused;

  const admin = createAdminClient();
  const [{ data: shop }, { data: garments }] = await Promise.all([
    admin
      .from("tailors")
      .select("avatar_public_id, cover_public_id")
      .eq("id", tailor.id)
      .single(),
    admin
      .from("garments")
      .select("garment_photos(public_id)")
      .eq("tailor_id", tailor.id),
  ]);

  const { error: eventsError } = await admin
    .from("analytics_events")
    .delete()
    .eq("tailor_id", tailor.id);
  if (eventsError) return failed;

  const { error } = await admin.auth.admin.deleteUser(account.userId);
  if (error) return failed;

  await admin.from("pin_attempts").delete().eq("phone", account.phone);

  const photos = [
    shop?.avatar_public_id,
    shop?.cover_public_id,
    ...(garments ?? []).flatMap((garment) =>
      garment.garment_photos.map((photo) => photo.public_id),
    ),
  ].filter((photo): photo is string => Boolean(photo));
  after(() => destroyPhotos(photos));

  const supabase = await createServerSupabase();
  await supabase.auth.signOut({ scope: "local" });
  const jar = await cookies();
  for (const cookie of jar.getAll()) {
    if (cookie.name.startsWith("sb-")) jar.delete(cookie.name);
  }
  jar.delete(rememberCookie);
  revalidatePath("/", "layout");
  redirect("/account-deleted", RedirectType.replace);
}
