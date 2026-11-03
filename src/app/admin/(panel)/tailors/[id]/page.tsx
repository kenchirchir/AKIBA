import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CircleCheck, Phone } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { VerificationForm } from "@/components/admin/verification-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setTailorStatus } from "@/lib/admin/actions";
import { getAdminTailor } from "@/lib/admin/data";
import { formatRwandaPhone, normalizeRwandaPhone } from "@/lib/auth/phone";
import { tailoringTypeSlugs } from "@/lib/catalogue";
import { experienceFrom } from "@/lib/experience";
import { areaNames } from "@/lib/kigali";

const notices = ["verified", "suspended", "pending"] as const;
const statusTones = {
  pending: "warning",
  verified: "success",
  suspended: "danger",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.tailor");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminTailorPage({
  params,
  searchParams,
}: PageProps<"/admin/tailors/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tailor = await getAdminTailor(id);
  if (!tailor) notFound();

  const [t, tailors, catalogue, levels, format] = await Promise.all([
    getTranslations("Admin.tailor"),
    getTranslations("Admin.tailors"),
    getTranslations("Catalogue"),
    getTranslations("Experience"),
    getFormatter(),
  ]);
  const notice = notices.find((key) => query[key] === "1");
  const area = areaNames(tailor.district, tailor.sector);
  const phone = normalizeRwandaPhone(tailor.profiles?.phone ?? "");
  const experience = tailor.tailoring_since
    ? experienceFrom(tailor.tailoring_since)
    : null;
  const status =
    tailor.status === "verified" || tailor.status === "suspended"
      ? tailor.status
      : "pending";
  const record = tailor.tailor_verifications;
  const facts: [string, string][] = [
    [t("owner"), tailor.owner_name],
    [t("area"), `${area.sector}, ${area.district}`],
    [t("address"), tailor.shop_address ?? "—"],
    [
      t("types"),
      tailoringTypeSlugs
        .filter((slug) => tailor.tailoring_types.includes(slug))
        .map((slug) => catalogue(`tailoringTypes.${slug}`))
        .join(", "),
    ],
    [
      t("experience"),
      experience
        ? `${levels(`levels.${experience.level}`)} · ${
            levels("short", {
              years: experience.years,
              months: experience.months,
            }).trim() || levels("underMonth")
          }`
        : "—",
    ],
    [
      t("joined"),
      format.dateTime(new Date(tailor.created_at), {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    ],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin/tailors?status=${status}`}
        className="flex w-fit items-center gap-1 text-label font-semibold text-teal hover:underline"
      >
        <ChevronLeft className="size-4" />
        {t("back")}
      </Link>
      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-card bg-brand-50 px-3 py-3 text-sm text-ink lg:max-w-3xl"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-teal" />
          {t(`notices.${notice}`)}
        </p>
      )}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col gap-5 rounded-card border border-line-soft bg-white p-5 lg:p-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={tailor.shop_name}
              publicId={tailor.avatar_public_id}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-heading">{tailor.shop_name}</h1>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant={statusTones[status]}>
                  {tailors(`status.${status}`)}
                </Badge>
                {tailor.is_sample && (
                  <Badge variant="neutral">{tailors("sample")}</Badge>
                )}
              </div>
            </div>
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex w-fit items-center gap-2 text-body font-semibold text-teal hover:underline"
            >
              <Phone className="size-4" />
              {formatRwandaPhone(phone)}
            </a>
          )}
          <dl className="grid gap-3 sm:grid-cols-[140px_1fr]">
            {facts.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-caption text-secondary">{label}</dt>
                <dd className="text-body text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {tailor.about && (
            <p className="text-body whitespace-pre-line text-ink-soft">
              {tailor.about}
            </p>
          )}
          <div>
            <h2 className="text-section">
              {t("garments", { count: tailor.garments.length })}
            </h2>
            <ul className="mt-2 flex flex-col divide-y divide-line-soft">
              {tailor.garments.map((garment) => (
                <li
                  key={garment.id}
                  className="flex items-center justify-between gap-3 py-2 text-body"
                >
                  <span className="truncate">{garment.name}</span>
                  <span className="shrink-0 text-caption text-secondary">
                    {t(
                      `garmentStatus.${garment.status === "approved" ? "approved" : garment.status === "rejected" ? "rejected" : "pending"}`,
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-card border border-line-soft bg-white p-5 lg:p-6">
            <div>
              <h2 className="text-section">{t("verifyTitle")}</h2>
              <p className="mt-1 text-body text-secondary">
                {t("verifyIntro")}
              </p>
            </div>
            <VerificationForm
              tailorId={tailor.id}
              verified={status === "verified"}
              record={record}
            />
          </section>
          {status !== "pending" && (
            <form
              action={setTailorStatus}
              className="flex flex-col gap-3 rounded-card border border-line-soft bg-white p-5 lg:p-6"
            >
              <input type="hidden" name="tailorId" value={tailor.id} />
              <input
                type="hidden"
                name="status"
                value={status === "verified" ? "suspended" : "pending"}
              />
              <p className="text-body text-secondary">
                {status === "verified" ? t("suspendIntro") : t("reopenIntro")}
              </p>
              <Button
                type="submit"
                variant={status === "verified" ? "danger" : "secondary"}
              >
                {status === "verified" ? t("suspend") : t("reopen")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
