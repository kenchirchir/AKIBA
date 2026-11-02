import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return { title: t("title") };
}

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-4 px-6 py-16">
      <Logo variant="bold" />
      <h1 className="mt-4 text-title">{t("title")}</h1>
      <p className="text-body text-secondary">{t("body")}</p>
      <Link href="/" className={buttonClasses({ className: "mt-2" })}>
        {t("home")}
      </Link>
    </main>
  );
}
