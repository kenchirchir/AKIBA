"use client";

import {
  useOptimistic,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { controlClasses } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { cn } from "@/lib/cn";
import { experienceLevels } from "@/lib/experience";
import { districts, findDistrict, sectorSlug } from "@/lib/kigali";

const filterKeys = ["q", "district", "sector", "type", "experience"] as const;

type FilterValues = Record<(typeof filterKeys)[number], string>;

const all = "all";
const none = Object.fromEntries(
  filterKeys.map((key) => [key, ""]),
) as FilterValues;

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
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink max-lg:sr-only">
        {label}
      </label>
      {children}
    </div>
  );
}

export function TailorFilters({ className }: { className?: string }) {
  const t = useTranslations("Tailors");
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
  const active = filterKeys.some((key) => searchParams.has(key));

  function navigate(next: FilterValues) {
    const params = new URLSearchParams();
    for (const key of filterKeys) {
      if (next[key]) params.set(key, next[key]);
    }
    const query = params.toString();

    startTransition(() => {
      setValues(next);
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function update(changes: Partial<FilterValues>) {
    navigate({ ...values, ...changes });
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    update({ q: typeof query === "string" ? query.trim() : "" });
  }

  return (
    <div
      aria-label={t("filters")}
      aria-busy={pending}
      role="group"
      className={cn("flex flex-col gap-3 lg:gap-5", className)}
    >
      <h2 className="hidden text-section lg:block">{t("filters")}</h2>
      <form role="search" action={pathname} onSubmit={search}>
        <label htmlFor="tailor-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-secondary" />
          <input
            key={current.q}
            id="tailor-search"
            name="q"
            type="search"
            defaultValue={current.q}
            placeholder={t("searchLabel")}
            enterKeyHint="search"
            className={cn("h-[46px] pr-4 pl-12", controlClasses)}
          />
        </div>
      </form>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-1 lg:gap-5">
        <FilterField id="tailor-district" label={t("district")}>
          <Select
            id="tailor-district"
            value={values.district || all}
            onChange={(event) =>
              update({ district: chosen(event.target.value), sector: "" })
            }
          >
            <option value={all}>{t("allDistricts")}</option>
            {districts.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField id="tailor-sector" label={t("sector")}>
          <Select
            id="tailor-sector"
            value={values.sector || all}
            disabled={!district}
            onChange={(event) => update({ sector: chosen(event.target.value) })}
          >
            <option value={all}>{t("anySector")}</option>
            {district?.sectors.map((name) => (
              <option key={name} value={sectorSlug(name)}>
                {name}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField id="tailor-type" label={t("type")}>
          <Select
            id="tailor-type"
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
        <FilterField id="tailor-experience" label={t("experience")}>
          <Select
            id="tailor-experience"
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
      </div>
      {(pending || active) && (
        <div className="flex items-center justify-between gap-3">
          {active && (
            <button
              type="button"
              onClick={() => navigate(none)}
              className="w-fit text-label text-teal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              {t("clearFilters")}
            </button>
          )}
          {pending && (
            <span role="status" className="text-caption text-secondary">
              {t("updating")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
