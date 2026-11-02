"use client";

import { useId, useState, type ReactNode } from "react";
import Form from "next/form";
import Link from "next/link";
import { ArrowRight, ChevronDown, Heart, MapPin, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { categories, collectionSlugs } from "@/lib/catalogue";
import { cn } from "@/lib/cn";
import { districts, findDistrict, sectorSlug } from "@/lib/kigali";

const rowClasses =
  "flex h-[45px] items-center justify-between text-sm tracking-[0.08em] uppercase";
const subItemClasses =
  "flex h-[34px] items-center text-caption tracking-[0.08em] uppercase hover:underline";

type UnderlineSelectProps = {
  name: string;
  label: string;
  display: string;
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  onChange: (value: string) => void;
  children: ReactNode;
};

function UnderlineSelect({
  name,
  label,
  display,
  value,
  disabled,
  icon,
  onChange,
  children,
}: UnderlineSelectProps) {
  return (
    <label
      className={cn(
        "relative flex h-10 items-center gap-1.5 border-b border-ink/30 focus-within:border-ink",
        disabled && "opacity-45",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-caption tracking-[0.08em] uppercase">
        {display}
      </span>
      <ChevronDown strokeWidth={1.8} className="size-4 shrink-0" />
      <select
        name={name}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 w-full cursor-pointer text-base opacity-0 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </label>
  );
}

export function BuyerMenu() {
  const searchId = useId();
  const t = useTranslations("BuyerMenu");
  const common = useTranslations("Common");
  const catalogue = useTranslations("Catalogue");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const selectedDistrict = findDistrict(district);
  const selectedSector = selectedDistrict?.sectors.find(
    (name) => sectorSlug(name) === sector,
  );

  function garmentsHref(params: Record<string, string>) {
    const search = new URLSearchParams(params);
    if (district) search.set("district", district);
    if (sector) search.set("sector", sector);
    return `/garments?${search.toString()}`;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label={common("home")}>
          <Logo />
        </Link>
        <Link
          href="/saved"
          aria-label={common("saved")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-ink/10"
        >
          <Heart strokeWidth={1.5} className="size-[26px]" />
        </Link>
      </div>

      <Form action="/garments" className="mt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-ink/30 focus-within:border-ink">
          <label htmlFor={searchId} className="sr-only">
            {t("searchLabel")}
          </label>
          <input
            id={searchId}
            name="q"
            type="search"
            placeholder={t("searchLabel")}
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-[13px] placeholder:tracking-[0.08em] placeholder:text-ink-soft placeholder:uppercase focus:outline-none"
          />
          <button
            type="submit"
            aria-label={t("search")}
            className="flex size-9 items-center justify-center rounded-full hover:bg-ink/10"
          >
            <Search className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <UnderlineSelect
            name="district"
            label={t("district")}
            display={selectedDistrict?.name ?? t("allOfKigali")}
            value={district}
            icon={<MapPin strokeWidth={2} className="size-4 shrink-0" />}
            onChange={(value) => {
              setDistrict(value);
              setSector("");
            }}
          >
            <option value="">{t("allOfKigali")}</option>
            {districts.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </UnderlineSelect>
          <UnderlineSelect
            name="sector"
            label={t("sector")}
            display={selectedSector ?? t("anySector")}
            value={sector}
            disabled={!selectedDistrict}
            onChange={setSector}
          >
            <option value="">{t("anySector")}</option>
            {selectedDistrict?.sectors.map((name) => (
              <option key={name} value={sectorSlug(name)}>
                {name}
              </option>
            ))}
          </UnderlineSelect>
        </div>
      </Form>

      <nav aria-label={t("categories")} className="mt-6">
        <details open className="group border-b border-ink/25">
          <summary
            className={cn(
              rowClasses,
              "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            {t("shopAll")}
            <ChevronDown
              strokeWidth={1.8}
              className="size-4 transition-transform group-open:rotate-180"
            />
          </summary>
          <ul className="pb-3">
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
        {categories.map((category) => {
          const label = catalogue(`categories.${category.slug}`);

          if (category.subcategories.length === 0) {
            return (
              <Link
                key={category.slug}
                href={garmentsHref({ category: category.slug })}
                className={cn(
                  rowClasses,
                  "border-b border-ink/25 hover:underline",
                )}
              >
                {label}
              </Link>
            );
          }

          return (
            <details
              key={category.slug}
              className="group border-b border-ink/25"
            >
              <summary
                className={cn(
                  rowClasses,
                  "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
                )}
              >
                {label}
                <ChevronDown
                  strokeWidth={1.8}
                  className="size-4 transition-transform group-open:rotate-180"
                />
              </summary>
              <ul className="pb-3">
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
          );
        })}
      </nav>

      <div className="mt-auto pt-10">
        <Link
          href="/tailors"
          className={cn(rowClasses, "border-y border-ink/25 hover:underline")}
        >
          {t("meetTailors")}
          <ArrowRight strokeWidth={1.8} className="size-4" />
        </Link>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-micro tracking-[0.08em] uppercase">
          <span className="font-semibold">{t("areYouTailor")}</span>
          <Link
            href="/join"
            className="text-right underline underline-offset-2"
          >
            {t("join")}
          </Link>
          <span className="text-ink-soft">{t("showcase")}</span>
          <Link
            href="/login"
            className="text-right underline underline-offset-2"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
