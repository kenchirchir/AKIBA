import type { Metadata } from "next";
import { CircleCheck, Shirt, TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RejectForm } from "@/components/admin/reject-form";
import { Button } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { approveGarment } from "@/lib/admin/actions";
import { getPendingGarments } from "@/lib/admin/data";
import {
  audienceSlugs,
  findCategory,
  findSubcategory,
  materialSlugs,
} from "@/lib/catalogue";

const notices = ["approved", "rejected"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.garments");
  return { title: t("title"), robots: { index: false } };
}

export default async function AdminGarmentsPage({
  searchParams,
}: PageProps<"/admin/garments">) {
  const [params, garments, t, story, catalogue] = await Promise.all([
    searchParams,
    getPendingGarments(),
    getTranslations("Admin.garments"),
    getTranslations("GarmentStory"),
    getTranslations("Catalogue"),
  ]);
  const notice = notices.find((key) => params[key] === "1");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title lg:text-[32px]">{t("title")}</h1>
        <p className="mt-1 text-body text-secondary">
          {t("intro", { count: garments.length })}
        </p>
      </div>
      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-card bg-brand-50 px-3 py-3 text-sm text-ink lg:max-w-3xl"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-teal" />
          {t(`notices.${notice}`)}
        </p>
      )}
      {garments.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-surface p-6 text-body text-secondary lg:max-w-2xl">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {garments.map((garment) => {
            const category = findCategory(garment.category);
            const subcategory = findSubcategory(
              category,
              garment.subcategory ?? undefined,
            );
            const material = materialSlugs.find(
              (slug) => slug === garment.material,
            );
            const audience = audienceSlugs.find(
              (slug) => slug === garment.audience,
            );
            const facts = [
              subcategory
                ? catalogue(`subcategories.${subcategory}`)
                : category && catalogue(`categories.${category.slug}`),
              material && catalogue(`materials.${material}`),
              audience && catalogue(`audiences.${audience}`),
              story("price", { price: garment.price_rwf }),
              garment.making_days &&
                `${story("madeIn")} ${story("days", { count: garment.making_days })}`,
            ].filter(Boolean);

            return (
              <li
                key={garment.id}
                className="grid gap-5 rounded-card border border-line-soft bg-white p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:p-6"
              >
                <ul className="grid grid-cols-3 gap-2">
                  {garment.garment_photos.length === 0 && (
                    <li className="flex aspect-[3/4] items-center justify-center rounded-lg bg-brand-50 text-teal">
                      <Shirt strokeWidth={1} className="size-8" />
                    </li>
                  )}
                  {garment.garment_photos.map((photo, index) => (
                    <li
                      key={photo.public_id}
                      className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface"
                    >
                      <CloudImage
                        publicId={photo.public_id}
                        alt={t("photoAlt", {
                          name: garment.name,
                          number: index + 1,
                        })}
                        fill
                        sizes="(min-width: 1024px) 13vw, 30vw"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
                <div className="flex min-w-0 flex-col gap-3">
                  <div>
                    <h2 className="text-heading">{garment.name}</h2>
                    <p className="text-caption text-secondary">
                      {t("by", {
                        shop: garment.tailors?.shop_name ?? "",
                        owner: garment.tailors?.owner_name ?? "",
                      })}
                    </p>
                  </div>
                  {garment.tailors?.status !== "verified" && (
                    <p className="flex gap-2 rounded-card bg-warning-50 p-3 text-caption text-warning-ink">
                      <TriangleAlert className="size-4 shrink-0" />
                      {t("shopNotVerified")}
                    </p>
                  )}
                  <p className="text-caption text-secondary">
                    {facts.join(" · ")}
                  </p>
                  <div>
                    <h3 className="text-label text-ink">{story("story")}</h3>
                    <p className="mt-1 text-body whitespace-pre-line text-ink-soft">
                      {garment.story}
                    </p>
                  </div>
                  {garment.description && (
                    <div>
                      <h3 className="text-label text-ink">
                        {story("description")}
                      </h3>
                      <p className="mt-1 text-body whitespace-pre-line text-ink-soft">
                        {garment.description}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-start gap-2">
                    <form action={approveGarment}>
                      <input
                        type="hidden"
                        name="garmentId"
                        value={garment.id}
                      />
                      <Button type="submit">{t("approve")}</Button>
                    </form>
                    <RejectForm garmentId={garment.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
