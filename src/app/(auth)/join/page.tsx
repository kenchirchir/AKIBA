import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JoinForm } from "@/components/auth/join-form";
import { AuthHeader } from "@/components/layout/auth-header";
import { getCurrentTailor } from "@/lib/tailor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Join");
  return { title: t("title") };
}

export default async function JoinPage() {
  if (await getCurrentTailor()) redirect("/shop");

  const t = await getTranslations("Join");

  return (
    <>
      <AuthHeader title={t("title")} />
      <JoinForm />
    </>
  );
}
