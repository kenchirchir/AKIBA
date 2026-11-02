import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import type { FeedGarment } from "@/lib/garments";
import { DetailsSwitch } from "./details-switch";
import { GarmentCard } from "./garment-card";

type GarmentGridProps = {
  garments: FeedGarment[];
  more?: ReactNode;
  clearHref?: string;
};

export function GarmentGrid({ garments, more, clearHref }: GarmentGridProps) {
  const t = useTranslations("Feed");

  if (garments.length === 0) {
    return (
      <div className="mb-12 flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-surface p-6 text-center">
        <p className="text-body text-secondary">{t("empty")}</p>
        {clearHref && (
          <Link
            href={clearHref}
            className={buttonClasses({ variant: "secondary", size: "md" })}
          >
            {t("showAll")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="group/feed pb-12 lg:pb-16">
      <DetailsSwitch />
      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 max-lg:group-has-[[data-details]:not(:checked)]/feed:gap-y-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
        {garments.map((garment) => (
          <li key={garment.id}>
            <GarmentCard garment={garment} />
          </li>
        ))}
      </ul>
      {more && <div className="mt-10 flex justify-center">{more}</div>}
    </div>
  );
}
