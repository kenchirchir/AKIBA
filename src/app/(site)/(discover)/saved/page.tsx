import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { LogoBar } from "@/components/layout/logo-bar";
import { Placeholder } from "@/components/layout/placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Saved");
  return { title: t("title") };
}

export default function SavedPage() {
  const t = useTranslations("Saved");

  return (
    <main className="flex-1">
      <LogoBar />
      <Container className="pt-4 pb-12 lg:pt-10">
        <h1 className="text-title lg:text-[36px]">{t("title")}</h1>
        <p className="mt-1 text-body text-secondary">{t("subtitle")}</p>
        <div className="mt-5 lg:mt-8 lg:max-w-2xl">
          <Placeholder milestone={7} description={t("placeholder")} />
        </div>
      </Container>
    </main>
  );
}
