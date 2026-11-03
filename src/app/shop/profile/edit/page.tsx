import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { getMyProfile } from "@/lib/profile/data";
import { requireTailor } from "@/lib/tailor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile");
  return { title: t("editTitle") };
}

export default async function EditProfilePage() {
  const tailor = await requireTailor();
  const [profile, t] = await Promise.all([
    getMyProfile(tailor.id),
    getTranslations("Profile"),
  ]);

  return (
    <main className="flex-1">
      <PageHeader title={t("editTitle")} backHref="/shop/profile" />
      <div className="px-5 pt-2 pb-12 lg:px-10">
        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
