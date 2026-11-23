"use client";

import { useState, useTransition } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isLocale, localeNames } from "@/i18n/config";
import {
  translateStory,
  type StoryTranslationResult,
} from "@/lib/translate/actions";
import { StoryText } from "./story-text";

type TranslatedStoryProps = {
  garmentId: string;
  story: string;
  description: string | null;
  canTranslate: boolean;
};

const linkClasses =
  "inline-flex cursor-pointer items-center gap-1.5 text-label font-semibold text-teal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-wait disabled:opacity-60";

export function TranslatedStory({
  garmentId,
  story,
  description,
  canTranslate,
}: TranslatedStoryProps) {
  const t = useTranslations("GarmentStory");
  const locale = useLocale();
  const language = isLocale(locale) ? localeNames[locale] : locale;
  const [result, setResult] = useState<StoryTranslationResult | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [pending, startTransition] = useTransition();
  const translated =
    showTranslation && result?.status === "translated" ? result : null;

  function onTranslate() {
    if (result?.status === "translated") {
      setShowTranslation(true);
      return;
    }
    startTransition(async () => {
      const next = await translateStory(garmentId);
      setResult(next);
      setShowTranslation(next.status === "translated");
    });
  }

  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-section">{t("story")}</h2>
        <div lang={translated ? locale : undefined} aria-live="polite">
          <StoryText
            key={translated ? "translated" : "original"}
            text={translated?.story ?? story}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {translated ? (
            <>
              <p className="text-caption text-secondary">{t("translatedBy")}</p>
              <button
                type="button"
                onClick={() => setShowTranslation(false)}
                className={linkClasses}
              >
                {t("showOriginal")}
              </button>
            </>
          ) : result?.status === "same-language" ? (
            <p className="text-caption text-secondary">
              {t("sameLanguage", { language })}
            </p>
          ) : canTranslate ? (
            <button
              type="button"
              onClick={onTranslate}
              disabled={pending}
              className={linkClasses}
            >
              <Languages className="size-4" strokeWidth={2.25} />
              {pending ? t("translating") : t("translate", { language })}
            </button>
          ) : null}
        </div>
        {result?.status === "error" && !pending && (
          <p role="alert" className="text-caption text-danger">
            {t("translateFailed")}
          </p>
        )}
      </section>
      {description && (
        <section className="flex flex-col gap-2">
          <h2 className="text-section">{t("description")}</h2>
          <p
            lang={translated?.description ? locale : undefined}
            className="text-body whitespace-pre-line text-ink-soft"
          >
            {translated?.description ?? description}
          </p>
        </section>
      )}
    </>
  );
}
