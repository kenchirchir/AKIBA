import { Shirt, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

export function DetailsSwitch() {
  const t = useTranslations("Feed");

  return (
    <label className="group/switch mb-5 flex w-fit cursor-pointer items-center gap-3 text-sm text-secondary lg:hidden">
      <input
        type="checkbox"
        role="switch"
        data-details
        aria-label={t("detailsLabel")}
        className="sr-only"
      />
      <span className="relative flex h-10 w-[76px] items-center justify-between rounded-full border-2 border-ink px-2 text-ink group-has-focus-visible/switch:outline-2 group-has-focus-visible/switch:outline-offset-2 group-has-focus-visible/switch:outline-teal">
        <Shirt strokeWidth={1.8} className="size-5" />
        <Tag strokeWidth={1.8} className="size-5" />
        <span className="absolute top-[3px] left-[3px] size-[30px] rounded-full bg-ink transition-transform group-has-checked/switch:translate-x-9" />
      </span>
      <span className="group-has-checked/switch:hidden">
        {t("showDetails")}
      </span>
      <span className="hidden group-has-checked/switch:inline">
        {t("hideDetails")}
      </span>
    </label>
  );
}
