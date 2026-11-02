"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function SiteError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations("Errors");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start justify-center gap-4 px-6 py-16">
      <h1 className="text-title">{t("title")}</h1>
      <p className="text-body text-secondary">{t("body")}</p>
      <Button onClick={() => retry()}>{t("retry")}</Button>
    </main>
  );
}
