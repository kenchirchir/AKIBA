import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AuthHeader } from "@/components/layout/auth-header";
import { Placeholder } from "@/components/layout/placeholder";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ResetPin");
  return { title: t("title") };
}

export default function ResetPinPage() {
  const t = useTranslations("ResetPin");

  return (
    <>
      <AuthHeader title={t("title")} />
      <div className="mt-8">
        <Placeholder milestone={5} description={t("placeholder")}>
          <Link
            href="/login"
            className={buttonClasses({ variant: "secondary", fullWidth: true })}
          >
            {t("backToLogin")}
          </Link>
        </Placeholder>
      </div>
    </>
  );
}
