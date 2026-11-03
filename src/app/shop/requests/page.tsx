import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { RequestActions } from "@/components/requests/request-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { markAllRequestsRead } from "@/lib/requests/actions";
import { dateParts } from "@/lib/requests/dates";
import { getMyRequests } from "@/lib/requests/inbox";
import { findBestTime, findSize } from "@/lib/requests/options";
import { requireTailor } from "@/lib/tailor";

const tabClasses =
  "flex h-[30px] items-center gap-1.5 rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-teal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Requests");
  return { title: t("title") };
}

export default async function RequestsPage({
  searchParams,
}: PageProps<"/shop/requests">) {
  const tailor = await requireTailor();
  const [params, requests, t, options, format] = await Promise.all([
    searchParams,
    getMyRequests(tailor.id),
    getTranslations("Requests"),
    getTranslations("RequestOptions"),
    getFormatter(),
  ]);
  const unreadOnly = params.show === "unread";
  const unread = requests.filter((request) => request.status === "new");
  const shown = unreadOnly ? unread : requests;
  const now = new Date();
  const tabs = [
    { href: "/shop/requests", label: t("all"), active: !unreadOnly },
    {
      href: "/shop/requests?show=unread",
      label: t("unread"),
      active: unreadOnly,
      count: unread.length,
    },
  ];

  return (
    <main className="flex-1">
      <PageHeader title={t("title")} backHref="/shop" />
      <div className="px-5 pt-2 pb-12 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <nav
            aria-label={t("tabs")}
            className="inline-flex gap-1 rounded-lg bg-mist p-[3px]"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  tabClasses,
                  tab.active
                    ? "bg-white font-semibold text-ink shadow-sm"
                    : "font-medium text-prose hover:text-ink",
                )}
              >
                {tab.label}
                {tab.count ? <Badge variant="count">{tab.count}</Badge> : null}
              </Link>
            ))}
          </nav>
          {unread.length > 0 && (
            <form action={markAllRequestsRead}>
              <button
                type="submit"
                className="text-label font-semibold text-teal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                {t("markAllRead")}
              </button>
            </form>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center lg:max-w-2xl">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-teal">
              <Inbox className="size-6" />
            </span>
            <p className="max-w-sm text-body text-secondary">
              {unreadOnly ? t("emptyUnread") : t("empty")}
            </p>
            {unreadOnly && requests.length > 0 && (
              <Link
                href="/shop/requests"
                className="text-label font-semibold text-teal hover:underline"
              >
                {t("showAll")}
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-5 grid gap-3 lg:grid-cols-2 lg:gap-4 2xl:grid-cols-3">
            {shown.map((request) => {
              const size = findSize(request.size);

              return (
                <li
                  key={request.id}
                  className="rounded-card border border-line-soft bg-white p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold">
                      <span className="truncate">{request.buyer_name}</span>
                      {request.status === "new" && <Badge>{t("new")}</Badge>}
                    </h2>
                    <time
                      dateTime={request.created_at}
                      className="shrink-0 text-caption text-secondary"
                    >
                      {format.relativeTime(new Date(request.created_at), now)}
                    </time>
                  </div>
                  <p className="mt-1 text-caption text-secondary">
                    {t("summary", {
                      quantity: request.quantity,
                      garment: request.garments?.name ?? t("deletedGarment"),
                      size: request.size,
                      sizeName: size ? options(`sizes.${size}`) : request.size,
                    })}
                    {request.needed_by &&
                      ` · ${t("neededBy", dateParts(format, request.needed_by))}`}
                  </p>
                  <p className="text-caption text-secondary">
                    {t("bestTime", { time: findBestTime(request.best_time) })}
                  </p>
                  <RequestActions
                    id={request.id}
                    phone={request.buyer_phone}
                    status={request.status}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
