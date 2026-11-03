"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { z } from "zod";
import { localRwandaPhone, normalizeRwandaPhone } from "@/lib/auth/phone";
import { visitorId } from "@/lib/discover/visitor";
import { sendSms } from "@/lib/sms";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentTailor } from "@/lib/tailor";
import { dateParts } from "./dates";
import type { RequestFormState } from "./errors";
import { sentRequest } from "./sent";
import {
  requestFieldErrors,
  requestSchema,
  type RequestDetails,
} from "./validation";

type Admin = ReturnType<typeof createAdminClient>;

const maxPerVisitorPerHour = 5;
const maxPerPhonePerDay = 5;
const failed: RequestFormState = { errors: { form: "generic" } };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function isId(value: unknown): value is string {
  return z.uuid().safeParse(value).success;
}

async function tooManyRequests(
  supabase: Admin,
  visitor: string,
  phone: string,
) {
  const [byVisitor, byPhone] = await Promise.all([
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", visitor)
      .gte("created_at", hoursAgo(1)),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("buyer_phone", phone)
      .gte("created_at", hoursAgo(24)),
  ]);

  return (
    (byVisitor.count ?? 0) >= maxPerVisitorPerHour ||
    (byPhone.count ?? 0) >= maxPerPhonePerDay
  );
}

async function smsText(request: RequestDetails, garmentName: string) {
  const t = await getTranslations("Sms");
  const options = await getTranslations("RequestOptions");
  const format = await getFormatter();
  const { day, month } = dateParts(format, request.neededBy);

  return t("request", {
    name: request.name,
    quantity: request.quantity,
    garment: garmentName,
    size: request.size,
    sizeName: options(`sizes.${request.size}`),
    day,
    month,
    phone: localRwandaPhone(request.phone),
    time: request.bestTime,
  });
}

export async function sendRequest(
  _state: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const parsed = requestSchema.safeParse({
    garmentId: text(formData, "garmentId"),
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    size: text(formData, "size"),
    quantity: text(formData, "quantity"),
    neededBy: text(formData, "neededBy"),
    bestTime: text(formData, "bestTime"),
  });

  if (!parsed.success) return { errors: requestFieldErrors(parsed.error) };

  const request = parsed.data;
  const supabase = createAdminClient();
  const { data: garment } = await supabase
    .from("garments")
    .select(
      "id, name, tailor_id, tailors!inner(status, sms_alerts, profiles(phone))",
    )
    .eq("id", request.garmentId)
    .eq("status", "approved")
    .eq("tailors.status", "verified")
    .maybeSingle();

  if (!garment) return { errors: { form: "unavailable" } };

  const visitor = await visitorId();
  if (await tooManyRequests(supabase, visitor, request.phone)) {
    return { errors: { form: "tooMany" } };
  }

  const { data: created, error } = await supabase
    .from("requests")
    .insert({
      garment_id: garment.id,
      tailor_id: garment.tailor_id,
      buyer_name: request.name,
      buyer_phone: request.phone,
      size: request.size,
      quantity: request.quantity,
      needed_by: request.neededBy,
      best_time: request.bestTime,
      visitor_id: visitor,
    })
    .select("id")
    .single();

  if (error || !created) return failed;

  const tailorPhone = garment.tailors.sms_alerts
    ? normalizeRwandaPhone(garment.tailors.profiles?.phone ?? "")
    : null;
  const message = await smsText(request, garment.name);

  after(async () => {
    await supabase.from("analytics_events").insert({
      event_type: "request_sent",
      garment_id: garment.id,
      tailor_id: garment.tailor_id,
      visitor_id: visitor,
    });

    if (tailorPhone && (await sendSms(tailorPhone, message))) {
      await supabase
        .from("requests")
        .update({ sms_sent_at: new Date().toISOString() })
        .eq("id", created.id);
    }
  });

  await sentRequest.save({ id: created.id });
  redirect(`/garments/${garment.id}/request-sent`);
}

async function signedInTailor() {
  const tailor = await getCurrentTailor();
  if (!tailor) return null;

  return { tailorId: tailor.id, supabase: await createServerSupabase() };
}

export async function markRequestRead(id: unknown) {
  const session = await signedInTailor();
  if (!session || !isId(id)) return;

  await session.supabase
    .from("requests")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("tailor_id", session.tailorId)
    .eq("id", id)
    .eq("status", "new");
  revalidatePath("/shop", "layout");
}

export async function markAllRequestsRead() {
  const session = await signedInTailor();
  if (!session) return;

  await session.supabase
    .from("requests")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("tailor_id", session.tailorId)
    .eq("status", "new");
  revalidatePath("/shop", "layout");
}

export async function setRequestOrdered(id: unknown, ordered: boolean) {
  const session = await signedInTailor();
  if (!session || !isId(id)) return;

  await session.supabase
    .from("requests")
    .update(
      ordered
        ? { status: "ordered", ordered_at: new Date().toISOString() }
        : { status: "read", ordered_at: null },
    )
    .eq("tailor_id", session.tailorId)
    .eq("id", id);
  revalidatePath("/shop", "layout");
}
