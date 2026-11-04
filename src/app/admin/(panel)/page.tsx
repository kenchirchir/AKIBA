import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getOverview } from "@/lib/admin/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.overview");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminOverviewPage() {
  const [overview, t] = await Promise.all([
    getOverview(),
    getTranslations("Admin.overview"),
  ]);
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
    </div>
  );
}
