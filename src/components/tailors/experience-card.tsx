import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { experienceFrom, experienceLevels } from "@/lib/experience";

export function ExperienceCard({ since }: { since: string }) {
  const t = useTranslations("Experience");
  const experience = experienceFrom(since);
  const current = experienceLevels.indexOf(experience.level);

  return (
    <section className="rounded-card border border-line-soft bg-white p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-label font-normal text-secondary">{t("title")}</h2>
        <Badge variant="outline">{t(`levels.${experience.level}`)}</Badge>
      </div>
      <p className="mt-2 text-[26px] leading-tight font-medium text-ink">
        {t("long", { years: experience.years, months: experience.months })}
      </p>
      <ol className="mt-4 grid grid-cols-4 gap-1.5">
        {experienceLevels.map((level, index) => (
          <li
            key={level}
            aria-current={index === current ? "step" : undefined}
            className="flex flex-col gap-1.5"
          >
            <span
              className={cn(
                "h-1.5 rounded-full",
                index <= current ? "bg-brand" : "bg-track",
              )}
            />
            <span
              className={cn(
                "text-micro",
                index === current ? "font-semibold text-ink" : "text-secondary",
              )}
            >
              {t(`scale.${level}.name`)}{" "}
              <span className="whitespace-nowrap">
                {t(`scale.${level}.years`)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
