import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Eye, Hourglass, Shirt } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MyGarmentCard } from "@/components/shop/my-garment-card";
import { buttonClasses } from "@/components/ui/button";
import { getMyGarments } from "@/lib/shop/garments";
import { requireTailor } from "@/lib/tailor";

const notices = ["uploaded", "saved", "deleted"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shop");
  return { title: t("title") };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const tailor = await requireTailor();
  const [params, garments, t] = await Promise.all([
    searchParams,
    getMyGarments(tailor.id),
    getTranslations("Shop"),
  ]);
  const firstName = tailor.owner_name.split(/\s+/)[0];
  const notice = notices.find((key) => params[key] === "1");
  const views = garments.reduce((total, garment) => total + garment.views, 0);

  return (
    <main className="flex-1">
      <div className="px-4 pt-4 pb-12 lg:px-10 lg:pt-10">
        <h1 className="sr-only lg:not-sr-only lg:text-[28px] lg:leading-tight lg:font-semibold lg:tracking-[-0.02em]">
          {t("title")}
        </h1>
        <p className="text-body text-secondary lg:mt-1">
          {t("greeting", { name: firstName, shop: tailor.shop_name })}
        </p>
        {notice && (
          <p
            role="status"
            className="mt-5 flex items-start gap-2 rounded-card bg-brand-50 px-3 py-3 text-sm text-ink lg:mt-8 lg:max-w-3xl"
          >
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-teal" />
            {t(`notices.${notice}`)}
          </p>
        )}
        {tailor.status === "pending" && (
          <section className="mt-5 flex gap-3 rounded-card bg-warning-50 p-4 text-warning-ink lg:mt-8 lg:max-w-3xl">
            <Hourglass className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="text-section">{t("pendingTitle")}</h2>
              <p className="mt-1 text-body">{t("pendingBody")}</p>
            </div>
          </section>
        )}
        <dl className="mt-5 grid grid-cols-2 gap-3 lg:mt-8 lg:max-w-xl lg:gap-4">
          <div className="rounded-card bg-linear-to-b from-brand-50 to-white p-3.5 lg:p-5">
            <dt className="flex items-center justify-between text-sm text-ink">
              {t("garments")}
              <Shirt aria-hidden="true" className="size-4 text-secondary" />
            </dt>
            <dd className="mt-1 text-heading text-ink">{garments.length}</dd>
          </div>
          <div className="rounded-card bg-linear-to-b from-brand-50 to-white p-3.5 lg:p-5">
            <dt className="flex items-center justify-between text-sm text-ink">
              {t("storyViews")}
              <Eye aria-hidden="true" className="size-4 text-secondary" />
            </dt>
            <dd className="mt-1 text-heading text-ink">{views}</dd>
          </div>
        </dl>
        <h2 className="mt-8 text-[19px] text-ink lg:mt-10">
          {t("myGarments")}
        </h2>
        {garments.length === 0 ? (
          <div className="mt-4 flex flex-col items-start gap-4 rounded-card border border-dashed border-line bg-surface p-5 lg:max-w-xl">
            <p className="text-body text-secondary">{t("empty")}</p>
            <Link href="/shop/upload" className={buttonClasses()}>
              {t("uploadFirst")}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">
            {garments.map((garment) => (
              <li key={garment.id}>
                <MyGarmentCard garment={garment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
