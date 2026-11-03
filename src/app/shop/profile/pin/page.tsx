import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ChangePinForm } from "@/components/profile/pin-forms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile.pin");
  return { title: t("title") };
}

export default function ChangePinPage() {
  const t = useTranslations("Profile.pin");

  return (
    <main className="flex-1">
      <PageHeader title={t("title")} backHref="/shop/profile" />
      <div className="px-5 pt-2 pb-12 lg:px-10">
        <div className="lg:max-w-md lg:rounded-card lg:bg-white lg:p-8">
          <ChangePinForm />
        </div>
      </div>
    </main>
  );
}
