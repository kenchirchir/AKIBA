import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import heroImage from "@/assets/welcome-hero.jpg";
import { GarmentGrid } from "@/components/garments/garment-grid";
import { Container } from "@/components/layout/container";
import { FeedHeader } from "@/components/layout/feed-header";
import { LogoBar } from "@/components/layout/logo-bar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { getFeedGarments } from "@/lib/garments";

export const revalidate = 60;

const values = ["verified", "stories", "calls"] as const;

export default async function WelcomePage() {
  const t = await getTranslations("Welcome");
  const feed = await getTranslations("Feed");
  const common = await getTranslations("Common");
  const { garments, hasMore } = await getFeedGarments({ limit: 8 });

  return (
    <main className="flex-1">
      <section className="bg-brand md:grid md:min-h-dvh md:grid-cols-2 md:bg-white lg:min-h-[calc(100dvh-5rem)]">
        <div className="relative aspect-[342/396] md:aspect-auto md:bg-brand">
          <Image
            src={heroImage}
            alt={t("imageAlt")}
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="relative -mt-6 px-5 pb-12 md:mt-0 md:flex md:flex-col md:justify-center md:px-10 md:py-16 xl:px-20">
          <div className="md:max-w-xl">
            <div className="mb-6 hidden md:block">
              <Badge>{t("pill")}</Badge>
            </div>
            <h1 className="text-display md:text-[40px] md:leading-[1.1] md:tracking-[-0.03em] xl:text-[56px]">
              {t.rich("title", {
                line: (chunks) => <span className="block">{chunks}</span>,
              })}
            </h1>
            <p className="mt-3 text-body text-ink-soft md:mt-6 md:text-lg md:text-secondary">
              {t("intro")}
            </p>
            <div className="mt-10 flex flex-col gap-2.5 md:mt-8 xl:flex-row-reverse xl:justify-end xl:gap-3">
              <Link
                href="/join"
                className={buttonClasses({
                  variant: "outline",
                  size: "lg",
                  fullWidth: true,
                  className: "xl:w-auto",
                })}
              >
                {t("join")}
              </Link>
              <a
                href="#tailor-offers"
                className={buttonClasses({
                  variant: "dark",
                  size: "lg",
                  fullWidth: true,
                  className: "xl:w-auto",
                })}
              >
                {t("discover")}
                <ArrowDown />
              </a>
            </div>
            <p className="mt-6 text-center text-sm text-ink-soft md:text-left">
              {t("alreadyTailor")}{" "}
              <Link
                href="/login"
                className="font-semibold text-ink underline underline-offset-2"
              >
                {t("login")}
              </Link>
            </p>
            <ul className="mt-12 hidden gap-6 border-t border-line-soft pt-8 md:grid md:grid-cols-3">
              {values.map((value) => (
                <li key={value} className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold">
                    {t(`values.${value}.title`)}
                  </span>
                  <span className="text-sm text-secondary">
                    {t(`values.${value}.body`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <LogoBar className="-mt-[34px] md:mt-0" />
      <section id="tailor-offers" className="scroll-mt-[34px] lg:scroll-mt-20">
        <Container>
          <FeedHeader
            as="h2"
            title={feed("title")}
            subtitle={`${feed("allGarments")} · ${common("kigali")}`}
            description={feed("showcase")}
          />
          <GarmentGrid
            garments={garments}
            more={
              hasMore && (
                <Link
                  href="/garments"
                  className={buttonClasses({
                    variant: "secondary",
                    size: "md",
                  })}
                >
                  {feed("seeAll")}
                </Link>
              )
            }
          />
        </Container>
      </section>
    </main>
  );
}
