import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Shirt } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { DecorativeCircles } from "@/components/layout/decorative-circles";
import { CallTailorLink } from "@/components/requests/call-tailor-link";
import { buttonClasses } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { formatRwandaPhone, normalizeRwandaPhone } from "@/lib/auth/phone";
import { cn } from "@/lib/cn";
import { areaNames } from "@/lib/kigali";
import { dateParts } from "@/lib/requests/dates";
import { findBestTime, findSize } from "@/lib/requests/options";
import { getSentRequest } from "@/lib/requests/sent";

const steps = ["call", "fitting", "pay"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RequestSent");
  return { title: t("title"), robots: { index: false } };
}

export default async function RequestSentPage({
  params,
}: PageProps<"/garments/[id]/request-sent">) {
  const { id } = await params;
  const request = await getSentRequest(id);
  if (!request?.tailors) redirect(`/garments/${id}`);

  const t = await getTranslations("RequestSent");
  const options = await getTranslations("RequestOptions");
  const format = await getFormatter();
  const tailor = request.tailors;
  const name = tailor.owner_name.split(/\s+/)[0];
  const area = areaNames(tailor.district, tailor.sector);
  const tailorPhone = normalizeRwandaPhone(tailor.profiles?.phone ?? "");
  const cover = request.garments?.garment_photos[0]?.public_id;
  const size = findSize(request.size);

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-5 pt-32 pb-10 md:px-8 md:pt-28 lg:px-10">
      <DecorativeCircles />
      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col md:grid md:flex-none md:grid-cols-2 md:items-start md:gap-12">
        <section className="flex flex-col">
          <span className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-ink">
            <Check strokeWidth={2.5} className="size-7" />
          </span>
          <h1 className="mt-6 text-[26px] leading-tight font-medium md:text-[32px]">
            {t("title")}
          </h1>
          <p className="mt-2 text-body text-secondary">
            {t.rich("body", {
              phone: formatRwandaPhone(request.buyer_phone),
              name,
              time: findBestTime(request.best_time),
              strong: (chunks) => (
                <strong className="font-semibold text-ink">{chunks}</strong>
              ),
            })}
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-card border border-line-soft p-3">
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-teal">
              {cover ? (
                <CloudImage
                  publicId={cover}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <Shirt strokeWidth={1.5} className="size-5" />
              )}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold text-ink">
                {t("summary", {
                  quantity: request.quantity,
                  garment: request.garments?.name ?? t("garment"),
                  size: request.size,
                  sizeName: size ? options(`sizes.${size}`) : request.size,
                })}
              </span>
              {request.needed_by && (
                <span className="text-caption font-semibold text-ink">
                  {t("neededBy", dateParts(format, request.needed_by))}
                </span>
              )}
              <span className="truncate text-caption text-secondary">
                {t("shop", {
                  shop: tailor.shop_name,
                  sector: area.sector,
                  district: area.district,
                })}
              </span>
            </span>
          </div>
        </section>

        <section className="mt-8 flex flex-1 flex-col md:mt-0 md:pt-[88px]">
          <h2 className="text-section">{t("nextTitle")}</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-micro font-semibold text-ink",
                    index === 0 ? "bg-brand" : "bg-mist",
                  )}
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{t(`steps.${step}`, { name })}</span>
              </li>
            ))}
          </ol>
          <div className="mt-auto flex flex-col gap-3 pt-10 md:mt-10">
            {tailorPhone && request.garments && (
              <>
                <p className="text-center text-caption text-secondary">
                  {t("cantWait")}
                </p>
                <CallTailorLink
                  phone={tailorPhone}
                  garmentId={request.garments.id}
                >
                  {t("callNow", { name })}
                </CallTailorLink>
              </>
            )}
            <Link
              href="/garments"
              className={buttonClasses({ size: "lg", fullWidth: true })}
            >
              {t("keepDiscovering")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
