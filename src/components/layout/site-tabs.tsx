"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  MapPin,
  Scissors,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { categories, type CategorySlug } from "@/lib/catalogue";
import { cn } from "@/lib/cn";
import { useSaved } from "@/lib/discover/saved";
import { districts } from "@/lib/kigali";

type Menu = "browse" | "discover" | "tailors";

const tabClasses =
  "flex h-10 items-center gap-1 rounded-lg px-2.5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-teal xl:px-3";
const footerLinkClasses =
  "inline-flex items-center gap-1 font-medium text-ink hover:text-teal hover:underline";
const closeDelay = 150;
const groupedCategories: CategorySlug[] = ["tops", "bottoms"];

function MenuItem({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-haze focus-visible:outline-2 focus-visible:outline-teal"
      >
        <Icon className="mt-0.5 size-[18px] shrink-0 text-ink" />
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-ink group-hover:text-teal">
            {title}
          </span>
          {description && (
            <span className="text-sm text-secondary">{description}</span>
          )}
        </span>
      </Link>
    </li>
  );
}

function MenuFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mx-2.5 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-soft pt-3 text-sm text-secondary">
      {children}
    </div>
  );
}

export function SiteTabs() {
  const t = useTranslations("Nav");
  const catalogue = useTranslations("Catalogue");
  const pathname = usePathname();
  const saved = useSaved();
  const baseId = useId();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState<Menu | null>(null);
  const savedCount = saved.garments.length + saved.tailors.length;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(null);
      navRef.current
        ?.querySelector<HTMLButtonElement>(
          `[aria-controls="${baseId}-${open}"]`,
        )
        ?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, baseId]);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function hoverOpen(menu: Menu) {
    cancelClose();
    setOpen(menu);
  }

  function hoverClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), closeDelay);
  }

  function closeOnLink(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      setOpen(null);
    }
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function tab(menu: Menu, label: string, active: boolean, panel: ReactNode) {
    const panelId = `${baseId}-${menu}`;
    const expanded = open === menu;

    return (
      <li
        className="relative"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hoverOpen(menu);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hoverClose();
        }}
      >
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setOpen(expanded ? null : menu)}
          className={cn(
            tabClasses,
            expanded ? "text-secondary" : active ? "text-teal" : "text-ink",
          )}
        >
          {label}
          <ChevronDown
            strokeWidth={2.25}
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
        <div
          id={panelId}
          hidden={!expanded}
          onClick={closeOnLink}
          className="absolute top-full left-0 z-40 pt-3"
        >
          <div className="animate-dropdown rounded-xl border border-line-soft bg-white p-2.5 shadow-dropdown">
            {panel}
          </div>
        </div>
      </li>
    );
  }

  const browse = (
    <div className="w-[600px]">
      <div className="grid grid-cols-3 gap-2 p-2.5">
        {groupedCategories.map((slug) => {
          const category = categories.find((item) => item.slug === slug);
          return (
            <div key={slug} className="flex flex-col gap-2">
              <Link
                href={`/garments?category=${slug}`}
                className="text-[15px] font-semibold text-ink hover:text-teal"
              >
                {catalogue(`categories.${slug}`)}
              </Link>
              <ul className="flex flex-col gap-1.5">
                {category?.subcategories.map((sub) => (
                  <li key={sub}>
                    <Link
                      href={`/garments?category=${slug}&sub=${sub}`}
                      className="text-[15px] text-ink-soft hover:text-teal hover:underline"
                    >
                      {catalogue(`subcategories.${sub}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold text-ink">
            {t("moreGarments")}
          </span>
          <ul className="flex flex-col gap-1.5">
            {categories
              .filter((item) => !groupedCategories.includes(item.slug))
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/garments?category=${item.slug}`}
                    className="text-[15px] text-ink-soft hover:text-teal hover:underline"
                  >
                    {catalogue(`categories.${item.slug}`)}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <MenuFooter>
        <MapPin className="size-4 shrink-0" />
        <span>{t("browseByArea")}</span>
        {districts.map((district) => (
          <Link
            key={district.slug}
            href={`/garments?district=${district.slug}`}
            className={footerLinkClasses}
          >
            {district.name}
          </Link>
        ))}
      </MenuFooter>
    </div>
  );

  const discover = (
    <div className="w-[400px]">
      <ul className="flex flex-col">
        <MenuItem
          href="/garments"
          icon={Sparkles}
          title={t("offersTitle")}
          description={t("offersBody")}
        />
        <MenuItem
          href="/garments?collection=women"
          icon={UserRound}
          title={t("womenTitle")}
          description={t("womenBody")}
        />
        <MenuItem
          href="/garments?collection=men"
          icon={UserRound}
          title={t("menTitle")}
          description={t("menBody")}
        />
      </ul>
      <MenuFooter>
        <BookOpen className="size-4 shrink-0" />
        <span>{t("showcase")}</span>
        <Link href="/terms#about" className={footerLinkClasses}>
          {t("howItWorks")}
          <ArrowRight className="size-3.5" />
        </Link>
      </MenuFooter>
    </div>
  );

  const tailors = (
    <div className="w-[400px]">
      <ul className="flex flex-col">
        <MenuItem
          href="/tailors"
          icon={Users}
          title={t("allTailorsTitle")}
          description={t("allTailorsBody")}
        />
        <MenuItem
          href="/tailors?experience=master"
          icon={Award}
          title={t("masterTitle")}
          description={t("masterBody")}
        />
        <li className="flex gap-3 p-2.5">
          <MapPin className="mt-0.5 size-[18px] shrink-0 text-ink" />
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-ink">
              {t("nearTitle")}
            </span>
            <span className="flex gap-3 text-sm">
              {districts.map((district) => (
                <Link
                  key={district.slug}
                  href={`/tailors?district=${district.slug}`}
                  className="text-secondary hover:text-teal hover:underline"
                >
                  {district.name}
                </Link>
              ))}
            </span>
          </span>
        </li>
      </ul>
      <MenuFooter>
        <Scissors className="size-4 shrink-0" />
        <span>{t("areYouTailor")}</span>
        <Link href="/join" className={footerLinkClasses}>
          {t("joinAkiba")}
          <ArrowRight className="size-3.5" />
        </Link>
      </MenuFooter>
    </div>
  );

  return (
    <nav ref={navRef} aria-label={t("label")} onPointerEnter={cancelClose}>
      <ul className="flex items-center gap-0.5">
        {tab("browse", t("browse"), false, browse)}
        {tab("discover", t("discover"), isActive("/garments"), discover)}
        {tab("tailors", t("tailors"), isActive("/tailors"), tailors)}
        <li>
          <Link
            href="/saved"
            aria-current={isActive("/saved") ? "page" : undefined}
            className={cn(
              tabClasses,
              isActive("/saved")
                ? "text-teal"
                : "text-ink hover:text-secondary",
            )}
          >
            {t("saved")}
            {savedCount > 0 && <Badge variant="count">{savedCount}</Badge>}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
