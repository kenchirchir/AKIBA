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
      <div className="grid h-20 w-full grid-cols-[1fr_minmax(0,560px)_1fr] items-center gap-6 px-8 xl:gap-8 xl:px-12">
        <Link
          href="/"
          aria-label={common("home")}
          className="justify-self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <Logo variant="bold" />
        </Link>
        <Form
          action="/garments"
          role="search"
          className="relative w-full min-w-0"
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
        <div className="flex items-center gap-4 justify-self-end xl:gap-6">
          <SiteTabs />
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
