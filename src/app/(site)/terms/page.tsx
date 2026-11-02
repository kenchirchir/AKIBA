import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { LogoBar } from "@/components/layout/logo-bar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  return { title: t("title") };
}

export default function TermsPage() {
  const t = useTranslations("Terms");

  return (
    <main className="flex-1">
      <LogoBar />
      <Container className="pt-4 pb-12 lg:pt-10">
        <h1 className="text-title lg:text-[36px]">{t("title")}</h1>
        <p className="mt-4 text-body text-secondary lg:max-w-2xl">
          {t("placeholder")}
        </p>
      </Container>
    </main>
  );
}
