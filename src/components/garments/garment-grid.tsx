import { useTranslations } from "next-intl";
import type { FeedGarment } from "@/lib/garments";
import { GarmentCard } from "./garment-card";

export function GarmentGrid({ garments }: { garments: FeedGarment[] }) {
  const t = useTranslations("Feed");

  if (garments.length === 0) {
    return (
      <p className="mb-12 rounded-card border border-dashed border-line bg-surface p-6 text-center text-body text-secondary">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 pb-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10 lg:pb-16">
      {garments.map((garment) => (
        <li key={garment.id}>
          <GarmentCard garment={garment} />
        </li>
      ))}
    </ul>
  );
}
