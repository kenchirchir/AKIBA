import Link from "next/link";
import { MapPin, Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { CloudImage } from "@/components/ui/cloud-image";
import { cn } from "@/lib/cn";
import type { FeedGarment } from "@/lib/garments";
import { findDistrict, findSector } from "@/lib/kigali";

const detail = "max-lg:group-has-[[data-details]:not(:checked)]/feed:hidden";

export function GarmentCard({ garment }: { garment: FeedGarment }) {
  const t = useTranslations("Feed");
  const district = findDistrict(garment.tailors.district);
  const sector = findSector(district, garment.tailors.sector);
  const area = [sector, district?.name].filter(Boolean).join(", ");
  const cover = garment.garment_photos[0];

  return (
    <Link
      href={`/garments/${garment.id}`}
      prefetch={false}
      className="group flex flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
    >
      <span className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-surface text-muted transition-colors group-hover:bg-brand-50">
        {cover ? (
          <CloudImage
            publicId={cover.public_id}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <Shirt strokeWidth={1} className="size-10" />
        )}
      </span>
      <span className="mt-3 text-[15px] leading-snug text-ink max-lg:group-has-[[data-details]:not(:checked)]/feed:sr-only">
        {garment.name}
      </span>
      <span className={cn("mt-1 text-[15px] font-semibold text-ink", detail)}>
        {t("price", { price: garment.price_rwf })}
      </span>
      <span
        className={cn(
          "mt-3 flex items-center gap-2 border-t border-line-soft pt-3 text-label font-normal text-ink",
          detail,
        )}
      >
        <Avatar name={garment.tailors.shop_name} size="xs" />
        <span className="truncate">{garment.tailors.shop_name}</span>
      </span>
      {area && (
        <span
          className={cn(
            "mt-2 flex items-center gap-1 text-micro text-teal",
            detail,
          )}
        >
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{area}</span>
        </span>
      )}
    </Link>
  );
}
