import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAdminTailors } from "@/lib/admin/data";
import { tailorStatuses } from "@/lib/admin/options";
import { formatRwandaPhone } from "@/lib/auth/phone";
import { cn } from "@/lib/cn";
import { areaNames } from "@/lib/kigali";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.tailors");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminTailorsPage({
  searchParams,
}: PageProps<"/admin/tailors">) {
  const params = await searchParams;
  const status =
    tailorStatuses.find((item) => item === params.status) ?? "pending";
  const [tailors, t, format] = await Promise.all([
    getAdminTailors(status),
    getTranslations("Admin.tailors"),
    getFormatter(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title lg:text-[32px]">{t("title")}</h1>
      <nav
        aria-label={t("tabs")}
        className="inline-flex w-fit gap-1 rounded-lg bg-mist p-[3px]"
      >
        {tailorStatuses.map((item) => (
          <Link
            key={item}
            href={`/admin/tailors?status=${item}`}
            aria-current={item === status ? "page" : undefined}
            className={cn(
              "flex h-[30px] items-center rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-teal",
              item === status
                ? "bg-white font-semibold text-ink shadow-sm"
                : "font-medium text-prose hover:text-ink",
            )}
          >
            {t(`status.${item}`)}
          </Link>
        ))}
      </nav>
      {tailors.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-surface p-6 text-body text-secondary lg:max-w-2xl">
          {t(`empty.${status}`)}
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {tailors.map((tailor) => {
            const area = areaNames(tailor.district, tailor.sector);

            return (
              <li key={tailor.id}>
                <Link
                  href={`/admin/tailors/${tailor.id}`}
                  className="flex items-center gap-4 rounded-card border border-line-soft bg-white p-4 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-teal"
                >
                  <Avatar name={tailor.shop_name} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold text-ink">
                        {tailor.shop_name}
                      </span>
                      {tailor.is_sample && (
                        <Badge variant="neutral">{t("sample")}</Badge>
                      )}
                    </span>
                    <span className="truncate text-caption text-secondary">
                      {[
                        tailor.owner_name,
                        tailor.profiles?.phone &&
                          formatRwandaPhone(tailor.profiles.phone),
                        `${area.sector}, ${area.district}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <span className="text-caption text-secondary">
                      {t("joined", {
                        date: format.dateTime(new Date(tailor.created_at), {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }),
                        count: tailor.garmentCount,
                      })}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-secondary" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
