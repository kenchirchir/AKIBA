import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ResetRequestForm } from "@/components/auth/reset-request-form";
import { AuthHeader } from "@/components/layout/auth-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ResetPin");
  return { title: t("title") };
}

export default function ResetPinPage() {
  const t = useTranslations("ResetPin");

  return (
    <>
      <AuthHeader title={t("title")} />
      <ResetRequestForm />
    </>
  );
}
