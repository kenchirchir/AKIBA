"use client";

import { useTranslations } from "next-intl";
import { track } from "@/lib/discover/track";

type DirectionsLinkProps = {
  href: string;
  trackedTailorId?: string;
};

export function DirectionsLink({ href, trackedTailorId }: DirectionsLinkProps) {
  const t = useTranslations("TailorProfile");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (trackedTailorId) {
          track({ type: "directions_click", tailorId: trackedTailorId });
        }
      }}
      className="w-fit text-label font-semibold text-teal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      {t("directions")}
      <span className="sr-only"> {t("opensMaps")}</span>
    </a>
  );
}
