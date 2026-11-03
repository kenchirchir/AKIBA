import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteAccountForm } from "@/components/profile/pin-forms";

const removed = ["shop", "garments", "requests", "usage"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile.delete");
  return { title: t("title") };
}

export default function DeleteAccountPage() {
  const t = useTranslations("Profile.delete");

  return (
    <main className="flex-1">
      <PageHeader title={t("title")} backHref="/shop/profile" />
      <div className="px-5 pt-2 pb-12 lg:px-10">
        <div className="flex flex-col gap-6 lg:grid lg:max-w-4xl lg:grid-cols-2 lg:items-start lg:rounded-card lg:bg-white lg:p-8">
          <section className="flex flex-col gap-3 rounded-card bg-danger/10 p-4 text-danger">
            <h2 className="flex items-center gap-2 text-section">
              <TriangleAlert className="size-5 shrink-0" />
              {t("warning")}
            </h2>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-body">
              {removed.map((item) => (
                <li key={item}>{t(`removed.${item}`)}</li>
              ))}
            </ul>
            <p className="text-body">{t("final")}</p>
          </section>
          <DeleteAccountForm />
        </div>
      </div>
    </main>
  );
}
