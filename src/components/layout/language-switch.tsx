import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/i18n/actions";
import { localeNames, locales } from "@/i18n/config";
import { cn } from "@/lib/cn";

type LanguageSwitchProps = {
  className?: string;
  full?: boolean;
};

export function LanguageSwitch({
  className,
  full = false,
}: LanguageSwitchProps) {
  const t = useTranslations("Language");
  const current = useLocale();

  return (
    <form
      action={setLocale}
      role="group"
      aria-label={t("choose")}
      className={cn("inline-flex gap-1 rounded-lg bg-mist p-[3px]", className)}
    >
      {locales.map((locale) => {
        const selected = locale === current;

        return (
          <button
            key={locale}
            type="submit"
            name="locale"
            value={locale}
            lang={locale}
            aria-pressed={selected}
            title={localeNames[locale]}
            className={cn(
              "flex h-[30px] items-center justify-center rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-teal",
              selected
                ? "bg-white font-semibold text-ink shadow-sm"
                : "cursor-pointer font-medium text-prose hover:text-ink",
            )}
          >
            {full ? localeNames[locale] : locale.toUpperCase()}
          </button>
        );
      })}
    </form>
  );
}
