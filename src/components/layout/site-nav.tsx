"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

const links = [
  { href: "/garments", key: "discover" },
  { href: "/tailors", key: "tailors" },
  { href: "/saved", key: "saved" },
] as const;

export function SiteNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-teal",
              active ? "text-teal" : "text-ink",
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
