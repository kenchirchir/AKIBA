import Link from "next/link";
import { Eye, Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import type { MyGarment } from "@/lib/shop/garments";

export function MyGarmentCard({ garment }: { garment: MyGarment }) {
  const t = useTranslations("Shop");
  const feed = useTranslations("Feed");

  return (
    <Link
      href={`/shop/garments/${garment.id}`}
      className="group flex flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
    >
      <span className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-surface">
        {garment.cover ? (
          <CloudImage
            publicId={garment.cover}
            alt=""
            fill
            sizes="(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted">
            <Shirt strokeWidth={1} className="size-10" />
          </span>
        )}
        {garment.status !== "approved" && (
          <Badge
            variant={garment.status === "rejected" ? "danger" : "warning"}
            className="absolute top-2 left-2"
          >
            {garment.status === "rejected"
              ? t("status.rejected")
              : t("status.pending")}
          </Badge>
        )}
      </span>
      <span className="mt-3 text-label font-normal text-ink">
        {garment.name}
      </span>
      <span className="mt-1 flex items-center gap-3 border-b border-line-soft pb-3">
        <span className="text-label font-semibold text-ink">
          {feed("price", { price: garment.price_rwf })}
        </span>
        <span className="flex items-center gap-1 text-micro text-secondary">
          <Eye aria-hidden="true" className="size-3.5" />
          <span aria-hidden="true">{garment.views}</span>
          <span className="sr-only">
            {t("views", { count: garment.views })}
          </span>
        </span>
      </span>
    </Link>
  );
}
