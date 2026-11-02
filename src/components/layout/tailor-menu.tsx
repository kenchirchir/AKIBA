import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { areaNames } from "@/lib/kigali";
import type { CurrentTailor } from "@/lib/tailor";

const rowClasses =
  "flex h-[53px] items-center justify-between border-b border-ink/25 text-sm tracking-[0.08em] uppercase hover:underline";
const noteClasses = "text-micro tracking-[0.1em] text-ink-soft";

export function TailorMenu({ tailor }: { tailor: CurrentTailor }) {
  const t = useTranslations("TailorMenu");
  const area = areaNames(tailor.district, tailor.sector);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Link href="/shop">
          <Logo />
        </Link>
        <Avatar name={tailor.shop_name} size="sm" />
      </div>
      <p className={`mt-6 uppercase ${noteClasses}`}>
        {t("signedInAs", { shop: tailor.shop_name })}
      </p>

      <nav aria-label={t("pages")} className="mt-6">
        <ul>
          <li>
            <Link href="/shop" className={rowClasses}>
              {t("myShop")}
              <span className={noteClasses}>
                {t("garmentCount", { count: tailor.garmentCount })}
              </span>
            </Link>
          </li>
          <li>
            <Link href="/shop/upload" className={rowClasses}>
              {t("upload")}
            </Link>
          </li>
          <li>
            <Link href="/shop/requests" className={rowClasses}>
              {t("requests")}
              {tailor.newRequests > 0 && (
                <span className={noteClasses}>
                  {t("newRequests", { count: tailor.newRequests })}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link href="/shop/profile" className={rowClasses}>
              {t("profile")}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 pt-10 text-micro tracking-[0.08em] uppercase">
        <span className="font-semibold">{tailor.shop_name}</span>
        <Link
          href={`/tailors/${tailor.id}`}
          className="text-right underline underline-offset-2"
        >
          {t("publicPage")}
        </Link>
        <span className="text-ink-soft">
          {area.sector}, {area.district}
        </span>
        <LogoutButton className="cursor-pointer text-right uppercase underline underline-offset-2">
          {t("logout")}
        </LogoutButton>
      </div>
    </div>
  );
}
