import Link from "next/link";
import { ChevronLeft, Eye, Hourglass, MapPin, Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/container";
import { BackButton } from "@/components/story/back-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CloudImage } from "@/components/ui/cloud-image";
import { iconButtonClasses } from "@/components/ui/icon-button";
import { VerifiedBadge } from "@/components/ui/verified";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { experienceFrom } from "@/lib/experience";
import { areaNames } from "@/lib/kigali";
import type { TailorDetails } from "@/lib/tailors";
import { DirectionsLink } from "./directions-link";
import { ExperienceCard } from "./experience-card";
import { TailorTracker } from "./tailor-tracker";

type TailorProfileProps = {
  tailor: TailorDetails;
  preview?: boolean;
};

function mapsHref(place: Array<string | null>) {
  const query = [...place, "Kigali", "Rwanda"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function TailorProfile({ tailor, preview = false }: TailorProfileProps) {
  const t = useTranslations("TailorProfile");
  const common = useTranslations("Common");
  const levels = useTranslations("Experience");
  const catalogue = useTranslations("Catalogue");
  const area = areaNames(tailor.district, tailor.sector);
  const firstName = tailor.owner_name.split(/\s+/)[0];
  const experience = tailor.tailoring_since
    ? experienceFrom(tailor.tailoring_since)
    : null;
  const specialities = tailoringTypeSlugs.filter((slug) =>
    tailor.tailoring_types.includes(slug),
  );
  const verified = tailor.status === "verified";

  return (
    <main className="flex-1">
      {!preview && <TailorTracker tailorId={tailor.id} />}
      <div className="relative h-[120px] bg-brand md:h-[160px] lg:h-[200px]">
        {tailor.cover_public_id && (
          <CloudImage
            publicId={tailor.cover_public_id}
            alt=""
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        )}
        <Container className="relative pt-5">
          {preview ? (
            <Link
              href="/shop"
              aria-label={common("back")}
              className={iconButtonClasses({
                variant: "glass",
                size: "lg",
                shape: "square",
              })}
            >
              <ChevronLeft />
            </Link>
          ) : (
            <BackButton fallbackHref="/tailors" variant="glass" />
          )}
        </Container>
      </div>
      <Container className="pb-12 md:grid md:grid-cols-2 md:items-start md:gap-8 lg:grid-cols-[400px_1fr] lg:gap-12 lg:pb-16 xl:grid-cols-[440px_1fr]">
        <section className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-3">
            <Avatar
              name={tailor.shop_name}
              publicId={tailor.avatar_public_id}
              size="xl"
              className="relative -mt-12 border-4 border-white lg:-mt-16 lg:size-32 lg:text-4xl"
            />
            {verified ? (
              <VerifiedBadge className="mb-2" />
            ) : (
              <Badge variant="warning" className="mb-2">
                <Hourglass className="size-3.5" />
                {t("pending")}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-display lg:text-[36px] lg:leading-tight">
              {tailor.shop_name}
            </h1>
            <p className="mt-1 text-body text-secondary">
              {experience
                ? t("byline", {
                    owner: tailor.owner_name,
                    time:
                      levels("short", {
                        years: experience.years,
                        months: experience.months,
                      }).trim() || levels("underMonth"),
                  })
                : tailor.owner_name}
            </p>
          </div>
          {tailor.about && (
            <p className="text-body whitespace-pre-line text-ink-soft">
              {tailor.about}
            </p>
          )}
          {preview && (
            <p className="flex gap-3 rounded-card bg-warning-50 p-4 text-body text-warning-ink">
              <Eye className="mt-1 size-4 shrink-0" />
              {t("previewNote")}
            </p>
          )}
          {tailor.tailoring_since && (
            <ExperienceCard since={tailor.tailoring_since} />
          )}
          {specialities.length > 0 && (
            <section>
              <h2 className="sr-only">{t("specialities")}</h2>
              <ul className="flex flex-wrap gap-2">
                {specialities.map((slug) => (
                  <li key={slug}>
                    <Chip variant="pill">
                      {catalogue(`tailoringTypes.${slug}`)}
                    </Chip>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="flex items-center gap-4 rounded-card border border-line-soft bg-white p-4 lg:p-5">
            <MapPin className="size-6 shrink-0 text-brand" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="sr-only">{t("location")}</h2>
              {tailor.shop_address && (
                <p className="text-[15px] font-semibold text-ink">
                  {tailor.shop_address}
                </p>
              )}
              <p className="text-caption text-secondary">
                {t("area", { sector: area.sector, district: area.district })}
              </p>
              <DirectionsLink
                href={mapsHref([
                  tailor.shop_address,
                  area.sector,
                  area.district,
                ])}
                trackedTailorId={preview ? undefined : tailor.id}
              />
            </div>
          </section>
          {tailor.garments.length > 0 && (
            <a
              href="#garments"
              className={buttonClasses({ size: "lg", fullWidth: true })}
            >
              {t("request", { name: firstName })}
            </a>
          )}
        </section>
        <section
          id="garments"
          aria-labelledby="garments-title"
          className="mt-8 scroll-mt-6 md:mt-6 lg:scroll-mt-28"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="garments-title" className="text-section">
              {t("garments")}
            </h2>
            <p className="text-caption text-secondary">
              {t("pieces", { count: tailor.garments.length })}
            </p>
          </div>
          {tailor.garments.length === 0 ? (
            <p className="mt-3 rounded-card border border-dashed border-line bg-surface p-5 text-body text-secondary">
              {t("noGarments", { name: firstName })}
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-4">
              {tailor.garments.map((garment) => (
                <li key={garment.id}>
                  <Link
                    prefetch={false}
                    href={
                      preview
                        ? `/shop/garments/${garment.id}`
                        : `/garments/${garment.id}`
                    }
                    className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-teal transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  >
                    {garment.cover ? (
                      <CloudImage
                        publicId={garment.cover}
                        alt={garment.name}
                        fill
                        sizes="(min-width: 768px) 20vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <Shirt strokeWidth={1} className="size-8" />
                        <span className="sr-only">{garment.name}</span>
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </main>
  );
}
