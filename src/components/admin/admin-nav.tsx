"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type AdminNavProps = {
  pendingTailors: number;
  pendingGarments: number;
};

export function AdminNav({ pendingTailors, pendingGarments }: AdminNavProps) {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: t("overview"), count: 0 },
    { href: "/admin/tailors", label: t("tailors"), count: pendingTailors },
    { href: "/admin/garments", label: t("garments"), count: pendingGarments },
    { href: "/admin/report", label: t("report"), count: 0 },
  ];

  return (
    <nav
      aria-label={t("label")}
      className="flex [scrollbar-width:none] gap-1 overflow-x-auto"
    >
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-teal",
              active ? "bg-brand-50 text-teal" : "text-ink hover:bg-mist",
            )}
          >
            {link.label}
            {link.count > 0 && <Badge variant="count">{link.count}</Badge>}
          </Link>
        );
      })}
    </nav>
  );
}
