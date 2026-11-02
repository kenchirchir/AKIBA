import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { AuthHeader } from "@/components/layout/auth-header";
import { pendingSignUp } from "@/lib/auth/pending";
import { nationalPart } from "@/lib/auth/phone";
import { getCurrentTailor } from "@/lib/tailor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Login");
  return { title: t("title") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentTailor()) redirect("/shop");

  const [{ verified }, pending, t] = await Promise.all([
    searchParams,
    pendingSignUp.read(),
    getTranslations("Login"),
  ]);

  return (
    <>
      <AuthHeader title={t("title")} />
      <LoginForm
        verified={verified === "1"}
        defaultPhone={pending ? nationalPart(pending.phone) : undefined}
      />
    </>
  );
}
