import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Eye,
  Globe,
  Hourglass,
  KeyRound,
  LogOut,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { PageHeader } from "@/components/layout/page-header";
import { HelpSheet } from "@/components/profile/help-sheet";
import { SmsAlertsSwitch } from "@/components/profile/sms-alerts-switch";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { VerifiedIcon } from "@/components/ui/verified";
import { getMyProfile } from "@/lib/profile/data";
import { publicPageHref, requireTailor } from "@/lib/tailor";

const notices = ["saved", "pin"] as const;

const rowBase =
  "flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left text-body";
const rowClasses = `${rowBase} text-ink`;
const dangerRowClasses = `${rowBase} text-danger`;
const iconClasses = "size-5 shrink-0 text-secondary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile");
  return { title: t("title") };
}

export default async function ProfilePage({
  searchParams,
}: PageProps<"/shop/profile">) {
  const tailor = await requireTailor();
  const [params, profile, t] = await Promise.all([
    searchParams,
    getMyProfile(tailor.id),
    getTranslations("Profile"),
  ]);
  const notice = notices.find((key) => params[key] === "1");
  const verified = profile.status === "verified";

  return (
    <main className="flex-1">
      <PageHeader title={t("title")} backHref="/shop" />
      <div className="px-5 pt-2 pb-12 lg:px-10">
        {notice && (
          <p
            role="status"
            className="mb-5 flex items-start gap-2 rounded-card bg-brand-50 px-3 py-3 text-sm text-ink lg:max-w-3xl"
          >
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-teal" />
            {t(`notices.${notice}`)}
          </p>
        )}
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="flex flex-col gap-5">
            <section className="flex items-center gap-4 rounded-card border border-line-soft bg-white p-4">
              <Avatar
                name={profile.shop_name}
                publicId={profile.avatar_public_id}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-section">{profile.shop_name}</h2>
                <p className="flex items-center gap-1.5 text-caption text-secondary">
                  <span className="truncate">{profile.owner_name}</span>
                  {verified ? (
                    <span className="flex shrink-0 items-center gap-1 font-semibold text-teal">
                      <VerifiedIcon className="size-3.5" />
                      {t("verified")}
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 font-semibold text-warning-ink">
                      <Hourglass className="size-3.5" />
                      {t("pending")}
                    </span>
                  )}
                </p>
              </div>
              <Link
                href="/shop/profile/edit"
                className={buttonClasses({ variant: "soft", size: "sm" })}
              >
                {t("edit")}
              </Link>
            </section>
            <section className="rounded-card border border-line-soft bg-white p-4">
              <p className="text-sm text-ink">
                {t("complete", { percent: profile.complete })}
              </p>
              <ProgressBar
                value={profile.complete}
                label={t("complete", { percent: profile.complete })}
                className="mt-2"
              />
              {profile.missing && (
                <Link
                  href="/shop/profile/edit"
                  className="mt-3 inline-block text-label font-semibold text-teal underline underline-offset-2"
                >
                  {t(`missing.${profile.missing}`)}
                </Link>
              )}
            </section>
          </div>

          <ul className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            <li>
              <Link href={publicPageHref(tailor)} className={rowClasses}>
                <Eye className={iconClasses} />
                <span className="flex-1">{t("viewAsBuyer")}</span>
                <ChevronRight className={iconClasses} />
              </Link>
            </li>
            <li className={rowClasses}>
              <MessageSquare className={iconClasses} />
              <SmsAlertsSwitch
                label={t("smsAlerts")}
                enabled={profile.sms_alerts}
              />
            </li>
            <li>
              <Link href="/shop/profile/pin" className={rowClasses}>
                <KeyRound className={iconClasses} />
                <span className="flex-1">{t("changePin")}</span>
                <ChevronRight className={iconClasses} />
              </Link>
            </li>
            <li className={rowClasses}>
              <Globe className={iconClasses} />
              <label htmlFor="language" className="flex-1">
                {t("language")}
              </label>
              <div className="w-40">
                <Select id="language" defaultValue="en">
                  <option value="en">{t("english")}</option>
                  <option value="rw" disabled>
                    {t("kinyarwanda")}
                  </option>
                </Select>
              </div>
            </li>
            <li>
              <HelpSheet className={rowClasses}>
                <CircleHelp className={iconClasses} />
                <span className="flex-1">{t("helpTerms")}</span>
                <ChevronRight className={iconClasses} />
              </HelpSheet>
            </li>
            <li>
              <LogoutButton className={`${dangerRowClasses} cursor-pointer`}>
                <LogOut className="size-5 shrink-0" />
                {t("logout")}
              </LogoutButton>
            </li>
            <li>
              <Link href="/shop/profile/delete" className={dangerRowClasses}>
                <Trash2 className="size-5 shrink-0" />
                <span className="flex-1">{t("deleteAccount")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
