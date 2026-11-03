import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getOverview } from "@/lib/admin/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.overview");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminOverviewPage() {
  const [overview, t, headerList] = await Promise.all([
    getOverview(),
    getTranslations("Admin.overview"),
    headers(),
  ]);
  const host = headerList.get("host") ?? "akiba-seven.vercel.app";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const cards = [
    {
      href: "/admin/tailors?status=pending",
      label: t("pendingTailors"),
      value: overview.pendingTailors,
    },
    {
      href: "/admin/garments",
      label: t("pendingGarments"),
      value: overview.pendingGarments,
    },
    {
      href: "/admin/tailors?status=verified",
      label: t("verifiedTailors"),
      value: overview.verifiedTailors,
    },
    {
      href: "/admin/tailors?status=suspended",
      label: t("suspendedTailors"),
      value: overview.suspendedTailors,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-title lg:text-[32px]">{t("title")}</h1>
        <p className="mt-1 text-body text-secondary">{t("intro")}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col gap-1 rounded-card border border-line-soft bg-white p-4 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-teal lg:p-5"
            >
              <span className="text-sm text-secondary">{card.label}</span>
              <span className="text-title">{card.value}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="flex flex-col gap-2 rounded-card border border-line-soft bg-white p-5 lg:max-w-3xl">
        <h2 className="text-section">{t("participantsTitle")}</h2>
        <p className="text-body text-secondary">{t("participantsBody")}</p>
        <code className="w-fit rounded-md bg-surface px-3 py-2 text-sm break-all text-ink">
          {`${protocol}://${host}/?p=B01`}
        </code>
        <p className="text-caption text-secondary">{t("participantsNote")}</p>
      </section>
    </div>
  );
}
