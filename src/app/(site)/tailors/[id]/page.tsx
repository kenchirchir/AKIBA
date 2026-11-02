import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Placeholder } from "@/components/layout/placeholder";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TailorProfile");
  return { title: t("title") };
}

export default function TailorProfilePage() {
  const t = useTranslations("TailorProfile");
  const common = useTranslations("Common");

  return (
    <main className="flex-1">
      <div className="h-[120px] bg-brand lg:h-[180px]">
        <Container className="pt-6">
          <Link
            href="/tailors"
            aria-label={common("back")}
            className="flex size-11 items-center justify-center rounded-xl bg-white/30 text-ink transition-colors hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </Container>
      </div>
      <Container className="pb-12">
        <span className="relative -mt-12 flex size-24 items-center justify-center rounded-full border-4 border-white bg-brand-100 text-teal lg:-mt-16 lg:size-32">
          <UserRound strokeWidth={1.5} className="size-10 lg:size-14" />
        </span>
        <h1 className="mt-4 text-title lg:text-[36px]">{t("title")}</h1>
        <div className="mt-5 lg:max-w-2xl">
          <Placeholder milestone={8} description={t("placeholder")}>
            <Link
              href="/garments"
              className={buttonClasses({
                variant: "secondary",
                fullWidth: true,
              })}
            >
              {t("seeGarments")}
            </Link>
          </Placeholder>
        </div>
      </Container>
    </main>
  );
}
