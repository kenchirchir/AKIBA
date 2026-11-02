import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { LogoBar } from "@/components/layout/logo-bar";
import { Placeholder } from "@/components/layout/placeholder";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tailors");
  return { title: t("title") };
}

export default function TailorsPage() {
  const t = useTranslations("Tailors");

  return (
    <main className="flex-1">
      <LogoBar />
      <Container className="pt-4 pb-12 lg:pt-10">
        <p className="text-label font-normal text-secondary">{t("eyebrow")}</p>
        <h1 className="mt-1 text-title lg:text-[36px]">{t("title")}</h1>
        <div className="mt-5 lg:mt-8 lg:max-w-2xl">
          <Placeholder milestone={8} description={t("placeholder")}>
            <Link
              href="/tailors/sample-tailor"
              className={buttonClasses({
                variant: "secondary",
                fullWidth: true,
              })}
            >
              {t("sampleTailor")}
            </Link>
          </Placeholder>
        </div>
      </Container>
    </main>
  );
}
