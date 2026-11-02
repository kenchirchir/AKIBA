import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { VerifyForm } from "@/components/auth/verify-form";
import { AuthHeader } from "@/components/layout/auth-header";
import { pendingSignUp } from "@/lib/auth/pending";
import { formatRwandaPhone } from "@/lib/auth/phone";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Verify");
  return { title: t("title") };
}

export default async function VerifyPage() {
  const pending = await pendingSignUp.read();
  if (!pending) redirect("/join");

  const t = await getTranslations("Verify");

  return (
    <>
      <AuthHeader title={t("title")} />
      <VerifyForm phone={formatRwandaPhone(pending.phone)} />
    </>
  );
}
