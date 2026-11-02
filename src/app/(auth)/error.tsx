"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function AuthError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations("Errors");

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-title">{t("title")}</h1>
      <p className="text-body text-secondary">{t("body")}</p>
      <Button onClick={() => retry()}>{t("retry")}</Button>
    </div>
  );
}
