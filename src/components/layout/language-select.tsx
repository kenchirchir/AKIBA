"use client";

import { useId, useTransition } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/i18n/actions";
import { localeNames, locales } from "@/i18n/config";
import { cn } from "@/lib/cn";

export function LanguageSelect({ className }: { className?: string }) {
  const t = useTranslations("Language");
  const locale = useLocale();
  const id = useId();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    const formData = new FormData();
    formData.set("locale", next);
    startTransition(() => setLocale(formData));
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-ink max-[359px]:hidden"
      >
        <Globe strokeWidth={2} className="size-[18px]" />
      </span>
      <label htmlFor={id} className="sr-only">
        {t("label")}
      </label>
      <div className="relative">
        <select
          id={id}
          value={locale}
          disabled={pending}
          onChange={(event) => change(event.target.value)}
          className="[field-sizing:content] h-9 cursor-pointer appearance-none rounded-md bg-transparent pr-7 pl-1 text-base font-medium text-ink focus-visible:outline-2 focus-visible:outline-teal disabled:cursor-wait disabled:opacity-70 [&_option]:text-ink"
        >
          {locales.map((option) => (
            <option key={option} value={option} lang={option}>
              {localeNames[option]}
            </option>
          ))}
        </select>
        <ChevronDown
          strokeWidth={2.25}
          className="pointer-events-none absolute top-1/2 right-1 size-[18px] -translate-y-1/2 text-ink"
        />
      </div>
    </div>
  );
}
