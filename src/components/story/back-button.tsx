"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/ui/icon-button";

type BackButtonProps = {
  fallbackHref?: string;
  variant?: "white" | "glass";
  className?: string;
};

export function BackButton({
  fallbackHref = "/garments",
  variant = "white",
  className,
}: BackButtonProps) {
  const t = useTranslations("Common");
  const router = useRouter();

  return (
    <IconButton
      label={t("back")}
      variant={variant}
      size="lg"
      shape="square"
      className={className}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
    >
      <ChevronLeft />
    </IconButton>
  );
}
