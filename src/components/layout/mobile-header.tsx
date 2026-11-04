"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { iconButtonClasses } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";

type MobileHeaderProps = {
  homeHref: string;
  end?: ReactNode;
  menu: ReactNode;
};

export function MobileHeader({ homeHref, end, menu }: MobileHeaderProps) {
  const t = useTranslations("Menu");
  const common = useTranslations("Common");
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeOnLink(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-white lg:hidden">
      <div className="flex h-16 items-center gap-2 px-3 md:px-6">
        <button
          ref={buttonRef}
          type="button"
          aria-label={open ? t("close") : t("open")}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(!open)}
          className={iconButtonClasses({
            variant: "white",
            size: "lg",
            className: "[&_svg]:size-6",
          })}
        >
          {open ? <X strokeWidth={2} /> : <Menu strokeWidth={2} />}
        </button>
        <Link
          href={homeHref}
          aria-label={common("home")}
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <Logo variant="bold" />
        </Link>
        <div className="ml-auto flex items-center gap-1">{end}</div>
      </div>
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 top-16 bottom-0 bg-ink/40"
        />
      )}
      <nav
        id={menuId}
        aria-label={t("label")}
        hidden={!open}
        onClick={closeOnLink}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] animate-dropdown overflow-y-auto border-t border-line-soft bg-white px-5 pt-3 pb-6 shadow-dropdown md:px-8"
      >
        {menu}
      </nav>
    </header>
  );
}
