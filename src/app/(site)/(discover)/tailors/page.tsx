import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { LogoBar } from "@/components/layout/logo-bar";
import { TailorFilters } from "@/components/tailors/tailor-filters";
import { TailorList } from "@/components/tailors/tailor-list";
import { buttonClasses } from "@/components/ui/button";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { searchText } from "@/lib/discover/search";
import { experienceLevels } from "@/lib/experience";
import { findDistrict, findSector, sectorSlug } from "@/lib/kigali";
import { getTailors } from "@/lib/tailors";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tailors");
  return { title: t("title") };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TailorsPage({
  searchParams,
}: PageProps<"/tailors">) {
  const params = await searchParams;
  const t = await getTranslations("Tailors");

  const query = first(params.q)?.trim() ?? "";
  const district = findDistrict(first(params.district));
  const sector = findSector(district, first(params.sector));
  const tailoringType = tailoringTypeSlugs.find(
    (slug) => slug === first(params.type),
  );
  const experience = experienceLevels.find(
    (level) => level === first(params.experience),
  );

  const tailors = await getTailors({
    search: searchText(query),
    district: district?.slug,
    sector: sector ? sectorSlug(sector) : undefined,
    tailoringType,
    experience,
  });
  const filtered = Object.keys(params).length > 0;

  return (
    <main className="flex-1">
      <LogoBar />
      <Container className="pt-4 pb-12 lg:pt-10 lg:pb-16">
        <p className="text-label font-normal text-secondary">{t("eyebrow")}</p>
        <h1 className="mt-1 text-title lg:text-[36px]">{t("title")}</h1>
        <div className="mt-5 lg:mt-8 lg:grid lg:grid-cols-[232px_1fr] lg:items-start lg:gap-10 xl:grid-cols-[260px_1fr]">
          <TailorFilters className="lg:sticky lg:top-28" />
          <section aria-label={t("results")} className="mt-5 lg:mt-0">
            {tailors.length > 0 ? (
              <>
                <p className="mb-4 text-caption text-secondary lg:mb-5 lg:text-sm">
                  {t("showing", { count: tailors.length })}
                </p>
                <TailorList tailors={tailors} />
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-surface p-6 text-center">
                <p className="text-body text-secondary">{t("empty")}</p>
                {filtered && (
                  <Link
                    href="/tailors"
                    className={buttonClasses({
                      variant: "secondary",
                      size: "md",
                    })}
                  >
                    {t("showAll")}
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
