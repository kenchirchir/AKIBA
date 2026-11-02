import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { iconButtonClasses } from "@/components/ui/icon-button";

type PageHeaderProps = {
  title: string;
  backHref: string;
};

export function PageHeader({ title, backHref }: PageHeaderProps) {
  const t = useTranslations("Common");

  return (
    <header className="flex items-center gap-3 px-5 pt-5 pb-2 lg:px-10 lg:pt-10 lg:pb-4">
      <Link
        href={backHref}
        aria-label={t("back")}
        className={iconButtonClasses({
          shape: "square",
          className: "lg:hidden",
        })}
      >
        <ChevronLeft />
      </Link>
      <h1 className="text-lg font-medium lg:text-[28px] lg:leading-tight lg:font-semibold lg:tracking-[-0.02em]">
        {title}
      </h1>
    </header>
  );
}
