import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TailorProfile } from "@/components/tailors/tailor-profile";
import { areaNames } from "@/lib/kigali";
import { photoUrl } from "@/lib/photos";
import { getTailorProfile } from "@/lib/tailors";

export const revalidate = 60;

const shareWidth = 1200;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/tailors/[id]">): Promise<Metadata> {
  const { id } = await params;
  const tailor = await getTailorProfile(id);
  if (!tailor) return {};

  const t = await getTranslations("TailorProfile");
  const area = areaNames(tailor.district, tailor.sector);
  const description = t("description", {
    shop: tailor.shop_name,
    owner: tailor.owner_name,
    sector: area.sector,
    district: area.district,
  });
  const cover = tailor.garments.find((garment) => garment.cover)?.cover;

  return {
    title: tailor.shop_name,
    description,
    openGraph: {
      type: "profile",
      title: tailor.shop_name,
      description,
      images: cover ? [{ url: photoUrl(cover, shareWidth) }] : undefined,
    },
  };
}

export default async function TailorPage({
  params,
}: PageProps<"/tailors/[id]">) {
  const { id } = await params;
  const tailor = await getTailorProfile(id);
  if (!tailor) notFound();

  return <TailorProfile tailor={tailor} />;
}
