import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { SavedItems } from "@/components/saved/saved-items";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Saved");
  return { title: t("title") };
}

export default function SavedPage() {
  const t = useTranslations("Saved");

  return (
    <main className="flex-1">
      <Container className="pt-4 pb-12 lg:pt-10">
        <p className="text-caption text-secondary">{t("subtitle")}</p>
        <h1 className="mt-1 text-title lg:text-[36px]">{t("title")}</h1>
        <SavedItems />
      </Container>
    </main>
  );
}
