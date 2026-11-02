import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { DecorativeCircles } from "@/components/layout/decorative-circles";
import { Placeholder } from "@/components/layout/placeholder";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RequestSent");
  return { title: t("title") };
}

export default function RequestSentPage() {
  const t = useTranslations("RequestSent");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-6 pt-32 pb-10 md:items-center md:justify-center md:pt-24">
      <DecorativeCircles />
      <div className="flex w-full max-w-lg flex-1 flex-col md:flex-none">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-ink">
          <Check strokeWidth={2.5} className="size-7" />
        </span>
        <h1 className="mt-6 text-[26px] leading-tight font-medium md:text-[32px]">
          {t("title")}
        </h1>
        <div className="mt-6">
          <Placeholder milestone={9} description={t("placeholder")} />
        </div>
        <Link
          href="/"
          className={buttonClasses({
            fullWidth: true,
            className: "mt-auto md:mt-8",
          })}
        >
          {t("keepDiscovering")}
        </Link>
      </div>
    </main>
  );
}
