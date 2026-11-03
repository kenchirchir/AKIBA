import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { getResearchReport } from "@/lib/admin/data";

const summaryKeys = [
  "story_views",
  "visitors",
  "participants",
  "reading_seconds",
  "saves",
  "unsaves",
  "tailor_views",
  "directions_clicks",
  "call_clicks",
  "requests",
  "requests_after_reading",
  "median_minutes_to_request",
] as const;

const cellClasses = "px-3 py-2 text-right whitespace-nowrap";
const headClasses =
  "px-3 py-2 text-right text-caption font-semibold whitespace-nowrap text-secondary";

function minutes(seconds: number) {
  return Math.round((seconds / 60) * 10) / 10;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.report");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminReportPage() {
  const [report, t, format] = await Promise.all([
    getResearchReport(),
    getTranslations("Admin.report"),
    getFormatter(),
  ]);
  const summary = report.summary;

  function summaryValue(key: (typeof summaryKeys)[number]) {
    const value = summary?.[key];
    if (value === null || value === undefined) return "—";
    if (key === "reading_seconds")
      return t("minutes", { count: minutes(value) });
    if (key === "median_minutes_to_request")
      return t("minutes", { count: value });
    return format.number(value);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title lg:text-[32px]">{t("title")}</h1>
          <p className="mt-1 max-w-3xl text-body text-secondary">
            {t("intro")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/admin/export/garments" method="get">
            <button
              type="submit"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              <Download />
              {t("downloadGarments")}
            </button>
          </form>
          <form action="/admin/export/participants" method="get">
            <button
              type="submit"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              <Download />
              {t("downloadParticipants")}
            </button>
          </form>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {summaryKeys.map((key) => (
          <div
            key={key}
            className="flex flex-col gap-1 rounded-card border border-line-soft bg-white p-4"
          >
            <dt className="text-caption text-secondary">
              {t(`measures.${key}`)}
            </dt>
            <dd className="text-heading text-ink">{summaryValue(key)}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">{t("participantsTitle")}</h2>
        {report.participants.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-surface p-5 text-body text-secondary lg:max-w-2xl">
            {t("noParticipants")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line-soft bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-line-soft">
                <tr>
                  <th scope="col" className={`${headClasses} text-left`}>
                    {t("columns.participant")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.story_views")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("columns.stories")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.reading_seconds")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.saves")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.tailor_views")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.requests")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.requests_after_reading")}
                  </th>
                  <th scope="col" className={headClasses}>
                    {t("measures.median_minutes_to_request")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {report.participants.map((row) => (
                  <tr key={row.participant_code}>
                    <th
                      scope="row"
                      className="px-3 py-2 text-left font-semibold"
                    >
                      {row.participant_code}
                    </th>
                    <td className={cellClasses}>{row.story_views}</td>
                    <td className={cellClasses}>{row.stories_viewed}</td>
                    <td className={cellClasses}>
                      {minutes(row.reading_seconds)}
                    </td>
                    <td className={cellClasses}>{row.saves}</td>
                    <td className={cellClasses}>{row.tailor_views}</td>
                    <td className={cellClasses}>{row.requests}</td>
                    <td className={cellClasses}>
                      {row.requests_after_reading}
                    </td>
                    <td className={cellClasses}>
                      {row.median_minutes_to_request ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-section">{t("garmentsTitle")}</h2>
        <div className="overflow-x-auto rounded-card border border-line-soft bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-line-soft">
              <tr>
                <th scope="col" className={`${headClasses} text-left`}>
                  {t("columns.garment")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.story_views")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.visitors")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.reading_seconds")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.saves")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.unsaves")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.requests")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.requests_after_reading")}
                </th>
                <th scope="col" className={headClasses}>
                  {t("measures.median_minutes_to_request")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {report.garments.map((row) => (
                <tr key={row.garment_id}>
                  <th
                    scope="row"
                    className="max-w-[260px] px-3 py-2 text-left font-normal"
                  >
                    <span className="block truncate font-semibold">
                      {row.garment_name}
                    </span>
                    <span className="flex items-center gap-2 text-caption text-secondary">
                      <span className="truncate">{row.shop_name}</span>
                      {row.is_sample && (
                        <Badge variant="neutral">{t("sample")}</Badge>
                      )}
                    </span>
                  </th>
                  <td className={cellClasses}>{row.story_views}</td>
                  <td className={cellClasses}>{row.visitors}</td>
                  <td className={cellClasses}>
                    {minutes(row.reading_seconds)}
                  </td>
                  <td className={cellClasses}>{row.saves}</td>
                  <td className={cellClasses}>{row.unsaves}</td>
                  <td className={cellClasses}>{row.requests}</td>
                  <td className={cellClasses}>{row.requests_after_reading}</td>
                  <td className={cellClasses}>
                    {row.median_minutes_to_request ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-caption text-secondary lg:max-w-3xl">
          {t("privacy")}
        </p>
      </section>
    </div>
  );
}
