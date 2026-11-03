import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { CloudImage } from "@/components/ui/cloud-image";
import { VerifiedIcon } from "@/components/ui/verified";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { experienceFrom } from "@/lib/experience";
import { areaNames } from "@/lib/kigali";
import type { ListedTailor } from "@/lib/tailors";

const coverSlots = 3;

export function TailorCard({ tailor }: { tailor: ListedTailor }) {
  const t = useTranslations("Tailors");
  const levels = useTranslations("Experience");
  const catalogue = useTranslations("Catalogue");
  const area = areaNames(tailor.district, tailor.sector);
  const experience = tailor.tailoring_since
    ? experienceFrom(tailor.tailoring_since)
    : null;
  const specialities = tailoringTypeSlugs
    .filter((slug) => tailor.tailoring_types.includes(slug))
    .map((slug) => catalogue(`tailoringTypes.${slug}`))
    .join(", ");
  const more = tailor.pieces - coverSlots;

  return (
    <Link
      href={`/tailors/${tailor.id}`}
      prefetch={false}
      className="flex h-full flex-col gap-3 rounded-card border border-line-soft bg-white p-4 transition-colors hover:bg-haze focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <span className="flex items-center gap-3 pr-12">
        <Avatar name={tailor.shop_name} publicId={tailor.avatar_public_id} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
            <span className="truncate">{tailor.shop_name}</span>
            <VerifiedIcon />
          </span>
          <span className="truncate text-caption text-secondary">
            {area.sector} · {area.district}
          </span>
        </span>
      </span>
      <span className="flex min-w-0 items-center gap-2 text-caption text-secondary">
        {experience && (
          <span className="shrink-0 rounded-md bg-mist px-2 py-0.5 text-micro font-semibold text-ink">
            {levels(`levels.${experience.level}`)}
          </span>
        )}
        <span className="truncate">
          {[
            experience &&
              (levels("short", {
                years: experience.years,
                months: experience.months,
              }).trim() ||
                levels("underMonth")),
            specialities,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      <span className="sr-only">{t("garments", { count: tailor.pieces })}</span>
      <span aria-hidden="true" className="mt-auto grid grid-cols-4 gap-2">
        {Array.from({ length: coverSlots }, (_, index) => (
          <span
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg bg-brand-50"
          >
            {tailor.covers[index] && (
              <CloudImage
                publicId={tailor.covers[index]}
                alt=""
                fill
                sizes="(min-width: 1280px) 90px, (min-width: 640px) 110px, 22vw"
                className="object-cover"
              />
            )}
          </span>
        ))}
        {more > 0 && (
          <span className="flex aspect-square items-center justify-center rounded-lg bg-mist text-sm font-semibold text-secondary">
            {t("more", { count: more })}
          </span>
        )}
      </span>
    </Link>
  );
}
