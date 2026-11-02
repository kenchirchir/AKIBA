import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Upload");
  return { title: t("title") };
}

export default function UploadPage() {
  const t = useTranslations("Upload");

  return (
    <main className="flex-1">
      <PageHeader title={t("title")} backHref="/shop" />
      <div className="px-5 pt-4 pb-12 lg:max-w-4xl lg:px-10">
        <Placeholder milestone={6} description={t("placeholder")} />
      </div>
    </main>
  );
}
