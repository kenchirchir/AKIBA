"use server";

import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { tailoringSince } from "@/lib/experience";
import { rememberCookie } from "@/lib/supabase/cookies";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AuthErrorKey, AuthFormState } from "./errors";
import { clearWrongPins, minutesLocked, recordWrongPin } from "./lockout";
import { pendingReset, pendingSignUp, type PendingSignUp } from "./pending";
import { pinToPassword } from "./pin";
import {
  authFieldErrors,
  codeSchema,
  loginSchema,
  newPinSchema,
  phoneSchema,
  shopDetailsSchema,
  signUpSchema,
  type ShopDetails,
} from "./validation";

type Supabase = SupabaseClient<Database>;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function authErrorKey(error: AuthError | null): AuthErrorKey {
  switch (error?.code) {
    case "phone_exists":
    case "user_already_exists":
      return "phoneTaken";
    case "invalid_credentials":
      return "wrongPin";
    case "otp_expired":
      return "codeWrong";
    case "over_sms_send_rate_limit":
    case "over_request_rate_limit":
      return "tooManyCodes";
    case "sms_send_failed":
      return "smsFailed";
    case "otp_disabled":
    case "user_not_found":
      return "noAccount";
    default:
      return "generic";
  }
}

async function ensureTailor(supabase: Supabase, user: User) {
  const { data: existing } = await supabase
    .from("tailors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) return true;

  const details = shopDetailsSchema.safeParse(user.user_metadata);
  if (!details.success) return false;

  const { error } = await supabase.from("tailors").insert({
    profile_id: user.id,
    owner_name: details.data.fullName,
    shop_name: details.data.fullName,
    district: details.data.district,
    sector: details.data.sector,
    shop_address: details.data.shopAddress,
    tailoring_types: details.data.tailoringTypes,
    tailoring_since: details.data.tailoringSince,
  });

  return !error;
}

async function homePath(supabase: Supabase, user: User) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") return "/admin";
  return (await ensureTailor(supabase, user)) ? "/shop" : null;
}

async function finishSignUp(
  supabase: Supabase,
  user: User,
  pending: PendingSignUp,
) {
  let current = user;

  if (pending.details) {
    const { data, error } = await supabase.auth.updateUser({
      data: pending.details,
    });
    if (error) return false;
    current = data.user;
  }

  if (pending.password) {
    const { error } = await supabase.auth.updateUser({
      password: pending.password,
    });
    if (error && error.code !== "same_password") return false;
  }

  return ensureTailor(supabase, current);
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    fullName: text(formData, "fullName"),
    phone: text(formData, "phone"),
    pin: text(formData, "pin"),
    district: text(formData, "district"),
    sector: text(formData, "sector"),
    tailoringTypes: formData.getAll("tailoringTypes"),
    years: text(formData, "years"),
    months: text(formData, "months"),
    shopAddress: text(formData, "shopAddress"),
    terms: text(formData, "terms"),
  });

  if (!parsed.success) return { errors: authFieldErrors(parsed.error) };

  const { phone, pin, years, months } = parsed.data;
  const password = pinToPassword(phone, pin);
  const details: ShopDetails = {
    fullName: parsed.data.fullName,
    district: parsed.data.district,
    sector: parsed.data.sector,
    shopAddress: parsed.data.shopAddress,
    tailoringTypes: parsed.data.tailoringTypes,
    tailoringSince: tailoringSince(years, months),
  };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
    options: { data: details },
  });

  if (error) return { errors: { form: authErrorKey(error) } };
  if (data.user?.identities?.length === 0) {
    return { errors: { phone: "phoneTaken" } };
  }

  await pendingSignUp.save({ phone, password, details });
  redirect("/join/verify");
}

export async function verifyPhone(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const pending = await pendingSignUp.read();
  if (!pending) redirect("/join");

  const parsed = codeSchema.safeParse({ code: text(formData, "code") });
  if (!parsed.success) return { errors: authFieldErrors(parsed.error) };

  const supabase = await createServerSupabase({ remember: false });
  const { data, error } = await supabase.auth.verifyOtp({
    phone: pending.phone,
    token: parsed.data.code,
    type: "sms",
  });

  if (error || !data.user) return { errors: { code: "codeWrong" } };

  const ready = await finishSignUp(supabase, data.user, pending);
  await supabase.auth.signOut({ scope: "local" });

  if (!ready) return { errors: { form: "setupFailed" } };

  await pendingSignUp.save({ phone: pending.phone });
  redirect("/login?verified=1");
}

export async function resendSignUpCode(): Promise<AuthFormState> {
  const pending = await pendingSignUp.read();
  if (!pending) redirect("/join");

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resend({
    type: "sms",
    phone: pending.phone,
  });

  return error ? { errors: { form: authErrorKey(error) } } : { sent: true };
}

export async function logIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    phone: text(formData, "phone"),
    pin: text(formData, "pin"),
  });

  if (!parsed.success) return { errors: authFieldErrors(parsed.error) };

  const { phone, pin } = parsed.data;
  const remember = formData.get("remember") === "on";

  const locked = await minutesLocked(phone);
  if (locked > 0) return { errors: { form: "locked" }, minutes: locked };

  const supabase = await createServerSupabase({ remember });
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password: pinToPassword(phone, pin),
  });

  if (error?.code === "phone_not_confirmed") {
    await pendingSignUp.save({ phone });
    await supabase.auth.resend({ type: "sms", phone });
    redirect("/join/verify");
  }

  if (error?.code === "invalid_credentials") {
    const lockedNow = await recordWrongPin(phone);
    return lockedNow > 0
      ? { errors: { form: "locked" }, minutes: lockedNow }
      : { errors: { pin: "wrongPin" } };
  }

  if (error || !data.user) return { errors: { form: authErrorKey(error) } };

  await clearWrongPins(phone);

  const home = await homePath(supabase, data.user);
  if (!home) {
    await supabase.auth.signOut({ scope: "local" });
    return { errors: { form: "setupFailed" } };
  }

  (await cookies()).set(rememberCookie, remember ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 365 : undefined,
  });
  await pendingSignUp.clear();
  redirect(home);
}

export async function requestPinReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = phoneSchema.safeParse({ phone: text(formData, "phone") });
  if (!parsed.success) return { errors: authFieldErrors(parsed.error) };

  const { phone } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: false },
  });

  if (error) return { errors: { form: authErrorKey(error) } };

  await pendingReset.save({ phone });
  redirect("/login/reset/verify");
}

export async function resendResetCode(): Promise<AuthFormState> {
  const pending = await pendingReset.read();
  if (!pending) redirect("/login/reset");

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    phone: pending.phone,
    options: { shouldCreateUser: false },
  });

  return error ? { errors: { form: authErrorKey(error) } } : { sent: true };
}

export async function resetPin(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const pending = await pendingReset.read();
  if (!pending) redirect("/login/reset");

  const parsed = newPinSchema.safeParse({
    code: text(formData, "code"),
    pin: text(formData, "pin"),
    confirm: text(formData, "confirm"),
  });

  if (!parsed.success) return { errors: authFieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: pending.phone,
    token: parsed.data.code,
    type: "sms",
  });

  if (error || !data.user) return { errors: { code: "codeWrong" } };

  const { error: updateError } = await supabase.auth.updateUser({
    password: pinToPassword(pending.phone, parsed.data.pin),
  });

  if (updateError && updateError.code !== "same_password") {
    return { errors: { form: authErrorKey(updateError) } };
  }

  await clearWrongPins(pending.phone);
  const home = await homePath(supabase, data.user);
  await pendingReset.clear();
  redirect(home ?? "/shop");
}

export async function logOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut({ scope: "local" });
  (await cookies()).delete(rememberCookie);
  redirect("/");
}
