import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { areaNames } from "@/lib/kigali";
import { publicPageHref, type CurrentTailor } from "@/lib/tailor";
import { TailorNav } from "./tailor-nav";

export function TailorSidebar({ tailor }: { tailor: CurrentTailor }) {
  const t = useTranslations("TailorNav");
  const area = areaNames(tailor.district, tailor.sector);

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line-soft bg-white px-4 py-6 lg:flex">
      <Link
        href="/shop"
        className="self-start rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-teal"
      >
        <Logo variant="bold" />
      </Link>
      <div className="mt-6 flex items-center gap-2.5 rounded-[14px] bg-haze p-2.5">
        <Avatar name={tailor.shop_name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{tailor.shop_name}</p>
          <p className="truncate text-caption text-secondary">
            {area.sector} · {area.district}
          </p>
        </div>
      </div>
      <TailorNav newRequests={tailor.newRequests} />
      <div className="mt-auto flex flex-col px-3 text-sm font-semibold">
        <Link
          href={publicPageHref(tailor)}
          className="py-2 text-teal hover:underline"
        >
          {t("publicPage")}
        </Link>
        <LogoutButton className="cursor-pointer py-2 text-left text-danger hover:underline">
          {t("logout")}
        </LogoutButton>
      </div>
    </aside>
  );
}
