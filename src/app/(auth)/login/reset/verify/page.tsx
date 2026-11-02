import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ResetPinForm } from "@/components/auth/reset-pin-form";
import { AuthHeader } from "@/components/layout/auth-header";
import { pendingReset } from "@/lib/auth/pending";
import { formatRwandaPhone } from "@/lib/auth/phone";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ResetPin");
  return { title: t("title") };
}

export default async function ResetPinVerifyPage() {
  const pending = await pendingReset.read();
  if (!pending) redirect("/login/reset");

  const t = await getTranslations("ResetPin");

  return (
    <>
      <AuthHeader title={t("title")} />
      <ResetPinForm phone={formatRwandaPhone(pending.phone)} />
    </>
  );
}
