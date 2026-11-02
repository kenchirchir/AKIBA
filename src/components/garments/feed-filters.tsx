"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { materialSlugs, tailoringTypeSlugs } from "@/lib/catalogue";
import { cn } from "@/lib/cn";
import { experienceLevels } from "@/lib/experience";
import { districts, findDistrict, sectorSlug } from "@/lib/kigali";

const filterKeys = [
  "district",
  "sector",
  "type",
  "experience",
  "material",
] as const;
const searchKeys = ["q", "category", "sub", "collection"] as const;

type FilterValues = Record<(typeof filterKeys)[number], string>;

const all = "all";

function chosen(value: string) {
  return value === all ? "" : value;
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

export function FeedFilters({ className }: { className?: string }) {
  const t = useTranslations("Feed");
  const menu = useTranslations("BuyerMenu");
  const catalogue = useTranslations("Catalogue");
  const experience = useTranslations("Experience");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = Object.fromEntries(
    filterKeys.map((key) => [key, searchParams.get(key) ?? ""]),
  ) as FilterValues;
  const [values, setValues] = useOptimistic(current);
  const district = findDistrict(values.district);
  const active = [...filterKeys, ...searchKeys].some((key) =>
    searchParams.has(key),
  );

  function navigate(href: string, next: FilterValues) {
    startTransition(() => {
      setValues(next);
      router.push(href, { scroll: false });
    });
  }

  function update(changes: Partial<FilterValues>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    navigate(`${pathname}?${params.toString()}`, { ...values, ...changes });
  }

  function clear() {
    navigate(
      pathname,
      Object.fromEntries(filterKeys.map((key) => [key, ""])) as FilterValues,
    );
  }

  return (
    <aside
      aria-label={t("filters")}
      aria-busy={pending}
      className={cn("flex-col gap-5", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-section">{t("filters")}</h2>
        {pending && (
          <span role="status" className="text-caption text-secondary">
            {t("updating")}
          </span>
        )}
      </div>
      <FilterField id="filter-district" label={menu("district")}>
        <Select
          id="filter-district"
          value={values.district || all}
          onChange={(event) =>
            update({ district: chosen(event.target.value), sector: "" })
          }
        >
          <option value={all}>{menu("allOfKigali")}</option>
          {districts.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </FilterField>
      <FilterField id="filter-sector" label={menu("sector")}>
        <Select
          id="filter-sector"
          value={values.sector || all}
          disabled={!district}
          onChange={(event) => update({ sector: chosen(event.target.value) })}
        >
          <option value={all}>{menu("anySector")}</option>
          {district?.sectors.map((name) => (
            <option key={name} value={sectorSlug(name)}>
              {name}
            </option>
          ))}
        </Select>
      </FilterField>
      <FilterField id="filter-type" label={t("tailoringType")}>
        <Select
          id="filter-type"
          value={values.type || all}
          onChange={(event) => update({ type: chosen(event.target.value) })}
        >
          <option value={all}>{t("allTypes")}</option>
          {tailoringTypeSlugs.map((slug) => (
            <option key={slug} value={slug}>
              {catalogue(`tailoringTypes.${slug}`)}
            </option>
          ))}
        </Select>
      </FilterField>
      <FilterField id="filter-experience" label={t("experience")}>
        <Select
          id="filter-experience"
          value={values.experience || all}
          onChange={(event) =>
            update({ experience: chosen(event.target.value) })
          }
        >
          <option value={all}>{t("anyExperience")}</option>
          {experienceLevels.map((level) => (
            <option key={level} value={level}>
              {experience(`levels.${level}`)}
            </option>
          ))}
        </Select>
      </FilterField>
      <FilterField id="filter-material" label={t("material")}>
        <Select
          id="filter-material"
          value={values.material || all}
          onChange={(event) => update({ material: chosen(event.target.value) })}
        >
          <option value={all}>{t("anyMaterial")}</option>
          {materialSlugs.map((slug) => (
            <option key={slug} value={slug}>
              {catalogue(`materials.${slug}`)}
            </option>
          ))}
        </Select>
      </FilterField>
      {active && (
        <button
          type="button"
          onClick={clear}
          className="w-fit text-label text-teal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {t("clearFilters")}
        </button>
      )}
    </aside>
  );
}
