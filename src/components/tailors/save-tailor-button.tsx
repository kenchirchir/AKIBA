"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { toggleSaved, useSaved } from "@/lib/discover/saved";

type SaveTailorButtonProps = {
  tailorId: string;
  shopName: string;
  className?: string;
};

export function SaveTailorButton({
  tailorId,
  shopName,
  className,
}: SaveTailorButtonProps) {
  const t = useTranslations("Tailors");
  const saved = useSaved().tailors.includes(tailorId);

  return (
    <IconButton
      label={t("save", { shop: shopName })}
      aria-pressed={saved}
      variant="outline"
      size="md"
      className={className}
      onClick={() => toggleSaved("tailors", tailorId)}
    >
      <Heart className={cn(saved && "fill-brand text-brand")} />
    </IconButton>
  );
}
