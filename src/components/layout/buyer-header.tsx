"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { iconButtonClasses } from "@/components/ui/icon-button";
import { Select } from "@/components/ui/select";
import { categories, collectionSlugs } from "@/lib/catalogue";
import { cn } from "@/lib/cn";
import { districts, findDistrict, sectorSlug } from "@/lib/kigali";
import { MobileHeader } from "./mobile-header";

const rowClasses =
  "flex h-12 w-full items-center gap-1 text-base font-semibold text-ink hover:text-teal";
const summaryClasses = cn(
  rowClasses,
  "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
);
const subItemClasses =
  "flex h-10 items-center pl-3 text-[15px] text-ink-soft hover:text-teal hover:underline";
const chevronClasses =
  "size-4 shrink-0 transition-transform group-open:rotate-180";

export function BuyerHeader() {
  const t = useTranslations("BuyerMenu");
  const common = useTranslations("Common");
  const catalogue = useTranslations("Catalogue");
  const pathname = usePathname();
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedDistrict = findDistrict(district);
  const showSearch = !pathname.startsWith("/tailors");

  function garmentsHref(params: Record<string, string>) {
    const search = new URLSearchParams(params);
    if (district) search.set("district", district);
    if (sector) search.set("sector", sector);
    return `/garments?${search.toString()}`;
  }

  const menu = (
    <div className="flex flex-col">
      <ul aria-label={t("categories")}>
        <li>
          <details className="group">
            <summary className={summaryClasses}>
              {t("shopAll")}
              <ChevronDown strokeWidth={2.25} className={chevronClasses} />
            </summary>
            <ul className="pb-2">
              {collectionSlugs.map((collection) => (
                <li key={collection}>
                  <Link
                    href={garmentsHref({ collection })}
                    className={subItemClasses}
                  >
                    {catalogue(`collections.${collection}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        {categories.map((category) => {
          const label = catalogue(`categories.${category.slug}`);

          if (category.subcategories.length === 0) {
            return (
              <li key={category.slug}>
                <Link
                  href={garmentsHref({ category: category.slug })}
                  className={rowClasses}
                >
                  {label}
                </Link>
              </li>
            );
          }

          return (
            <li key={category.slug}>
              <details className="group">
                <summary className={summaryClasses}>
                  {label}
                  <ChevronDown strokeWidth={2.25} className={chevronClasses} />
                </summary>
                <ul className="pb-2">
                  <li>
                    <Link
                      href={garmentsHref({ category: category.slug })}
                      className={subItemClasses}
                    >
                      {t("allIn", { category: label })}
                    </Link>
                  </li>
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory}>
                      <Link
                        href={garmentsHref({
                          category: category.slug,
                          sub: subcategory,
                        })}
                        className={subItemClasses}
                      >
                        {catalogue(`subcategories.${subcategory}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
        <li>
          <Link href="/tailors" className={rowClasses}>
            {t("meetTailors")}
            <ArrowRight strokeWidth={2.25} className="size-4" />
          </Link>
        </li>
      </ul>
      <div className="mt-4 flex flex-col gap-1 border-t border-line-soft pt-4">
        <p className="text-sm font-semibold text-ink">{t("areYouTailor")}</p>
        <p className="text-sm text-secondary">{t("showcase")}</p>
        <div className="mt-2 flex items-center gap-5">
          <Link
            href="/join"
            className="text-base font-semibold text-teal hover:underline"
          >
            {t("join")}
          </Link>
          <Link
            href="/login"
            className="text-base font-semibold text-ink hover:underline"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileHeader
        homeHref="/"
        menu={menu}
        end={
          <Link
            href="/saved"
            aria-label={common("saved")}
            className={iconButtonClasses({
              variant: "white",
              size: "lg",
              className: "[&_svg]:size-6",
            })}
          >
            <Heart strokeWidth={1.75} />
          </Link>
        }
      />
      {showSearch && (
        <Form
          action="/garments"
          role="search"
          onSubmit={() => setFiltersOpen(false)}
          className="border-b border-line-soft bg-white px-4 py-3 md:px-6 lg:hidden"
        >
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="mobile-search" className="sr-only">
                {t("searchLabel")}
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-secondary" />
              <input
                id="mobile-search"
                name="q"
                type="search"
                enterKeyHint="search"
                placeholder={t("searchLabel")}
                className="h-12 w-full rounded-lg border border-line bg-haze pr-4 pl-12 text-base text-ink transition-colors placeholder:text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
              />
            </div>
            <button
              type="button"
              aria-label={t("filters")}
              aria-expanded={filtersOpen}
              aria-controls="mobile-search-filters"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={iconButtonClasses({
                variant: filtersOpen ? "brand" : "outline",
                size: "lg",
                shape: "square",
                className: "relative size-12 rounded-lg",
              })}
            >
              <SlidersHorizontal strokeWidth={2} />
              {district && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-teal" />
              )}
            </button>
          </div>
          <div
            id="mobile-search-filters"
            hidden={!filtersOpen}
            className="mt-3 animate-dropdown"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <label
                  htmlFor="mobile-district"
                  className="text-label text-ink"
                >
                  {t("district")}
                </label>
                <Select
                  id="mobile-district"
                  name="district"
                  value={district}
                  onChange={(event) => {
                    setDistrict(event.target.value);
                    setSector("");
                  }}
                >
                  <option value="">{t("allOfKigali")}</option>
                  {districts.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="mobile-sector" className="text-label text-ink">
                  {t("sector")}
                </label>
                <Select
                  id="mobile-sector"
                  name="sector"
                  value={sector}
                  disabled={!selectedDistrict}
                  onChange={(event) => setSector(event.target.value)}
                >
                  <option value="">{t("anySector")}</option>
                  {selectedDistrict?.sectors.map((name) => (
                    <option key={name} value={sectorSlug(name)}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button type="submit" variant="dark" fullWidth className="mt-3">
              <Search />
              {t("search")}
            </Button>
          </div>
        </Form>
      )}
    </>
  );
}
