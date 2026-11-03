import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedIcon } from "@/components/ui/verified";
import { experienceFrom } from "@/lib/experience";
import type { GarmentStory } from "@/lib/garments";
import { findDistrict, findSector } from "@/lib/kigali";

export function MakerCard({ tailor }: { tailor: GarmentStory["tailors"] }) {
  const t = useTranslations("Experience");
  const district = findDistrict(tailor.district);
  const sector = findSector(district, tailor.sector);
  const area = [sector, district?.name].filter(Boolean).join(", ");
  const experience = tailor.tailoring_since
    ? experienceFrom(tailor.tailoring_since)
    : null;
  const duration =
    experience &&
    (t("short", {
      years: experience.years,
      months: experience.months,
    }).trim() ||
      t("underMonth"));

  return (
    <Link
      href={`/tailors/${tailor.id}`}
      prefetch={false}
      className="flex items-center gap-4 rounded-card border border-line-soft bg-white p-4 transition-colors hover:bg-haze focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <Avatar name={tailor.shop_name} size="lg" />
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="flex max-w-full items-center gap-1.5 text-[17px] font-semibold text-ink">
          <span className="truncate">{tailor.shop_name}</span>
          <VerifiedIcon />
        </span>
        <span className="max-w-full truncate text-caption text-secondary">
          {[tailor.owner_name, area].filter(Boolean).join(" · ")}
        </span>
        {experience && (
          <span className="rounded-md bg-mist px-2 py-0.5 text-micro font-semibold text-ink">
            {t(`levels.${experience.level}`)} · {duration}
          </span>
        )}
      </span>
      <ChevronRight className="size-5 shrink-0 text-secondary" />
    </Link>
  );
}
