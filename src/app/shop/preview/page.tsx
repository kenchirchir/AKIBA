import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TailorProfile } from "@/components/tailors/tailor-profile";
import { requireTailor } from "@/lib/tailor";
import { getProfilePreview } from "@/lib/tailors";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TailorProfile");
  return { title: t("previewTitle") };
}

export default async function ProfilePreviewPage() {
  const tailor = await requireTailor();
  if (tailor.status === "verified") redirect(`/tailors/${tailor.id}`);

  const profile = await getProfilePreview(tailor.id);
  if (!profile) notFound();

  return <TailorProfile tailor={profile} preview />;
}
