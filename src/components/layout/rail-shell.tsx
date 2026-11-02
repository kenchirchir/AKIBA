import type { ReactNode } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { MenuDrawer } from "./menu-drawer";

type RailShellProps = {
  menu: ReactNode;
  showSaved?: boolean;
  children: ReactNode;
};

export function RailShell({
  menu,
  showSaved = true,
  children,
}: RailShellProps) {
  const t = useTranslations("Common");

  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 h-dvh w-12 shrink-0 bg-brand lg:hidden">
        {showSaved && (
          <Link
            href="/saved"
            aria-label={t("saved")}
            className="absolute top-5 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <Heart strokeWidth={1.5} className="size-[26px]" />
          </Link>
        )}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <MenuDrawer>{menu}</MenuDrawer>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
