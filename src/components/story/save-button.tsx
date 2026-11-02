"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { toggleSaved, useSaved } from "@/lib/discover/saved";
import { track } from "@/lib/discover/track";

type SaveButtonProps = {
  garmentId: string;
  size?: "md" | "lg";
  shape?: "circle" | "square";
  className?: string;
};

export function SaveButton({
  garmentId,
  size = "lg",
  shape = "square",
  className,
}: SaveButtonProps) {
  const t = useTranslations("GarmentStory");
  const saved = useSaved().garments.includes(garmentId);

  return (
    <IconButton
      label={t("save")}
      aria-pressed={saved}
      variant="white"
      size={size}
      shape={shape}
      className={className}
      onClick={() => {
        const now = toggleSaved("garments", garmentId);
        track({ type: now ? "save" : "unsave", garmentId });
      }}
    >
      <Heart className={cn(saved && "fill-brand text-brand")} />
    </IconButton>
  );
}
