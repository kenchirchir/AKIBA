"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const links = [
  { href: "/shop", key: "myShop", section: "/shop/garments" },
  { href: "/shop/upload", key: "upload", section: "/shop/upload" },
  { href: "/shop/requests", key: "requests", section: "/shop/requests" },
  { href: "/shop/profile", key: "profile", section: "/shop/profile" },
] as const;

export function TailorNav({ newRequests }: { newRequests: number }) {
  const t = useTranslations("TailorNav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="mt-8 flex flex-col gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(link.section);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center justify-between rounded-card px-3 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-teal",
              active
                ? "bg-brand-50 font-bold text-teal"
                : "font-semibold text-ink hover:bg-mist",
            )}
          >
            {t(link.key)}
            {link.key === "requests" && newRequests > 0 && (
              <Badge variant="count">{newRequests}</Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
