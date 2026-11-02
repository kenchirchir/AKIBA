"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/ui/icon-button";

export function BackButton({ className }: { className?: string }) {
  const t = useTranslations("Common");
  const router = useRouter();

  return (
    <IconButton
      label={t("back")}
      variant="white"
      size="lg"
      shape="square"
      className={className}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/garments");
      }}
    >
      <ChevronLeft />
    </IconButton>
  );
}
