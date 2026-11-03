import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SiteTabs } from "./site-tabs";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const common = useTranslations("Common");

  return (
    <header className="sticky top-0 z-30 hidden border-b border-line-soft bg-white lg:block">
      <div className="flex h-20 w-full items-center gap-6 px-8 xl:gap-8 xl:px-12">
        <Link
          href="/"
          aria-label={common("home")}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <Logo variant="bold" />
        </Link>
        <Form
          action="/garments"
          role="search"
          className="relative max-w-[560px] min-w-0 flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-secondary" />
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder={t("searchPlaceholder")}
            className="h-12 w-full rounded-lg border border-line bg-haze pr-4 pl-12 text-base text-ink transition-colors placeholder:text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
          />
        </Form>
        <div className="ml-auto shrink-0">
          <SiteTabs />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className={buttonClasses({ variant: "outline", size: "md" })}
          >
            {t("tailorLogin")}
          </Link>
        </div>
      </div>
    </header>
  );
}
