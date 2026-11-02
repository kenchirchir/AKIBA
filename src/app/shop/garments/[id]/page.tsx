import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlert, Eye, Hourglass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteGarment } from "@/components/shop/delete-garment";
import { GarmentForm } from "@/components/shop/garment-form";
import { getMyGarment } from "@/lib/shop/garments";
import { requireTailor } from "@/lib/tailor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("EditGarment");
  return { title: t("title") };
}

export default async function EditGarmentPage({
  params,
}: PageProps<"/shop/garments/[id]">) {
  const { id } = await params;
  const tailor = await requireTailor();
  const garment = await getMyGarment(tailor.id, id);

  if (!garment) notFound();

  const t = await getTranslations("EditGarment");

  return (
    <main className="flex-1">
      <PageHeader title={t("title")} backHref="/shop" />
      <div className="flex flex-col gap-6 px-5 pt-4 pb-12 lg:px-10">
        {garment.status === "pending" && (
          <p className="flex gap-3 rounded-card bg-warning-50 p-4 text-body text-warning-ink lg:max-w-3xl">
            <Hourglass className="mt-1 size-4 shrink-0" />
            {t("pending")}
          </p>
        )}
        {garment.status === "rejected" && (
          <div className="flex gap-3 rounded-card bg-danger/10 p-4 text-body text-danger lg:max-w-3xl">
            <CircleAlert className="mt-1 size-4 shrink-0" />
            <div>
              <p className="font-semibold">
                {garment.rejection_reason
                  ? t("rejected", { reason: garment.rejection_reason })
                  : t("rejectedNoReason")}
              </p>
              <p>{t("rejectedHelp")}</p>
            </div>
          </div>
        )}
        {garment.status === "approved" && (
          <p className="flex gap-3 rounded-card bg-brand-50 p-4 text-body text-ink lg:max-w-3xl">
            <Eye className="mt-1 size-4 shrink-0 text-teal" />
            {t("approved")}
          </p>
        )}
        <GarmentForm garment={garment} />
        <DeleteGarment id={garment.id} />
      </div>
    </main>
  );
}
