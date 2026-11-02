import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { LogoBar } from "@/components/layout/logo-bar";
import { Placeholder } from "@/components/layout/placeholder";
import { buttonClasses } from "@/components/ui/button";
import { demoTailor } from "@/lib/demo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shop");
  return { title: t("title") };
}

export default function ShopPage() {
  const t = useTranslations("Shop");

  return (
    <main className="flex-1">
      <LogoBar />
      <div className="px-4 pt-4 pb-12 lg:max-w-4xl lg:px-10 lg:pt-10">
        <h1 className="sr-only lg:not-sr-only lg:text-[28px] lg:leading-tight lg:font-semibold lg:tracking-[-0.02em]">
          {t("title")}
        </h1>
        <p className="text-body text-secondary lg:mt-1">
          {t("greeting", {
            name: demoTailor.firstName,
            shop: demoTailor.shopName,
          })}
        </p>
        <div className="mt-5 lg:mt-8">
          <Placeholder milestone={6} description={t("placeholder")}>
            <Link
              href="/shop/upload"
              className={buttonClasses({ fullWidth: true })}
            >
              {t("upload")}
            </Link>
            <Link
              href="/shop/requests"
              className={buttonClasses({
                variant: "secondary",
                fullWidth: true,
              })}
            >
              {t("requests")}
            </Link>
            <Link
              href="/shop/profile"
              className={buttonClasses({
                variant: "secondary",
                fullWidth: true,
              })}
            >
              {t("profile")}
            </Link>
          </Placeholder>
        </div>
      </div>
    </main>
  );
}
