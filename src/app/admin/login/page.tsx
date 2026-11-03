import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { DecorativeCircles } from "@/components/layout/decorative-circles";
import { Logo } from "@/components/ui/logo";
import { getCurrentAdmin } from "@/lib/admin/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.login");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const t = await getTranslations("Admin.login");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-6 pt-36 pb-10 md:items-center md:justify-center md:pt-16">
      <DecorativeCircles />
      <div className="relative w-full md:max-w-md">
        <header className="flex items-baseline justify-between gap-4">
          <Logo variant="bold" />
          <h1 className="text-heading">{t("title")}</h1>
        </header>
        <p className="mt-4 text-body text-secondary">{t("intro")}</p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
