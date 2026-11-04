import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoutButton } from "@/components/auth/logout-button";
import { areaNames } from "@/lib/kigali";
import { publicPageHref, type CurrentTailor } from "@/lib/tailor";

const rowClasses =
  "flex h-12 items-center justify-between gap-3 text-base font-semibold text-ink hover:text-teal";
const noteClasses = "text-sm font-normal text-secondary";

export function TailorMenu({ tailor }: { tailor: CurrentTailor }) {
  const t = useTranslations("TailorMenu");
  const area = areaNames(tailor.district, tailor.sector);

  return (
    <div className="flex flex-col">
      <p className={noteClasses}>
        {t("signedInAs", { shop: tailor.shop_name })}
      </p>
      <ul aria-label={t("pages")} className="mt-2">
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
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-t border-line-soft pt-4">
        <span className="truncate text-sm font-semibold text-ink">
          {tailor.shop_name}
        </span>
        <Link
          href={publicPageHref(tailor)}
          className="text-right text-base font-semibold text-teal hover:underline"
        >
          {t("publicPage")}
        </Link>
        <span className="truncate text-sm text-secondary">
          {area.sector}, {area.district}
        </span>
        <LogoutButton className="cursor-pointer text-right text-base font-semibold text-ink hover:underline">
          {t("logout")}
        </LogoutButton>
      </div>
    </div>
  );
}
