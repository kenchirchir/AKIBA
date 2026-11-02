import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Heart, Shirt } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Placeholder } from "@/components/layout/placeholder";
import { buttonClasses } from "@/components/ui/button";
import { IconButton, iconButtonClasses } from "@/components/ui/icon-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("GarmentStory");
  return { title: t("title") };
}

export default async function GarmentStoryPage({
  params,
}: PageProps<"/garments/[id]">) {
  const { id } = await params;
  const t = await getTranslations("GarmentStory");
  const common = await getTranslations("Common");

  return (
    <main className="flex-1 lg:py-10">
      <div className="lg:mx-auto lg:grid lg:max-w-[1320px] lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-10">
        <div className="relative flex aspect-[390/368] items-center justify-center bg-brand-100 text-teal lg:aspect-[4/5] lg:rounded-card">
          <Shirt strokeWidth={1} className="size-16 lg:size-24" />
          <Link
            href="/"
            aria-label={common("back")}
            className={iconButtonClasses({
              variant: "white",
              size: "lg",
              className: "absolute top-4 left-4",
            })}
          >
            <ChevronLeft />
          </Link>
          <IconButton
            label={t("save")}
            variant="white"
            size="lg"
            className="absolute top-4 right-4"
          >
            <Heart />
          </IconButton>
        </div>
        <div className="flex flex-col gap-5 px-5 pt-6 pb-12 md:px-8 lg:px-0 lg:pt-2">
          <h1 className="text-title lg:text-[36px]">{t("title")}</h1>
          <Placeholder milestone={7} description={t("placeholder")}>
            <Link
              href={`/garments/${id}/request-sent`}
              className={buttonClasses({ fullWidth: true })}
            >
              {t("request")}
            </Link>
            <Link
              href="/tailors/sample-tailor"
              className={buttonClasses({
                variant: "secondary",
                fullWidth: true,
              })}
            >
              {t("meetTailor")}
            </Link>
          </Placeholder>
        </div>
      </div>
    </main>
  );
}
