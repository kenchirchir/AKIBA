import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { demoTailor } from "@/lib/demo";
import { TailorNav } from "./tailor-nav";

export function TailorSidebar() {
  const t = useTranslations("TailorNav");
  const tailor = demoTailor;

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line-soft bg-white px-4 py-6 lg:flex">
      <Link
        href="/shop"
        className="self-start rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-teal"
      >
        <Logo variant="bold" />
      </Link>
      <div className="mt-6 flex items-center gap-2.5 rounded-[14px] bg-haze p-2.5">
        <Avatar name={tailor.shopName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{tailor.shopName}</p>
          <p className="truncate text-caption text-secondary">
            {tailor.sector} · {tailor.district}
          </p>
        </div>
      </div>
      <TailorNav newRequests={tailor.newRequests} />
      <div className="mt-auto flex flex-col px-3 text-sm font-semibold">
        <Link
          href={`/tailors/${tailor.id}`}
          className="py-2 text-teal hover:underline"
        >
          {t("publicPage")}
        </Link>
        <Link href="/" className="py-2 text-danger hover:underline">
          {t("logout")}
        </Link>
      </div>
    </aside>
  );
}
