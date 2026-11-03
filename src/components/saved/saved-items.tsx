"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { GarmentCard } from "@/components/garments/garment-card";
import { SaveButton } from "@/components/story/save-button";
import { TailorList } from "@/components/tailors/tailor-list";
import { buttonClasses } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { loadSavedGarments, loadSavedTailors } from "@/lib/discover/actions";
import { useSaved } from "@/lib/discover/saved";

type Loaded<Item> = { requested: string[]; items: Item[] };

const emptyTexts = {
  garments: {
    title: "emptyTitle",
    body: "emptyBody",
    action: "discover",
    href: "/garments",
  },
  tailors: {
    title: "emptyTailorsTitle",
    body: "emptyTailorsBody",
    action: "meetTailors",
    href: "/tailors",
  },
} as const;

const gridClasses =
  "grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10";

function subscribeNever() {
  return () => {};
}

function EmptySaved({ kind }: { kind: keyof typeof emptyTexts }) {
  const t = useTranslations("Saved");
  const text = emptyTexts[kind];

  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-teal">
        <Heart className="size-6" />
      </span>
      <h2 className="text-section">{t(text.title)}</h2>
      <p className="max-w-sm text-body text-secondary">{t(text.body)}</p>
      <Link
        href={text.href}
        className={buttonClasses({ size: "md", className: "mt-2" })}
      >
        {t(text.action)}
      </Link>
    </div>
  );
}

function LoadingGrid() {
  const t = useTranslations("Saved");

  return (
    <ul aria-busy="true" aria-label={t("loading")} className={gridClasses}>
      {[0, 1].map((item) => (
        <li key={item} className="flex flex-col gap-3">
          <span className="aspect-[3/4] animate-pulse rounded-lg bg-surface" />
          <span className="h-4 w-3/4 animate-pulse rounded bg-surface" />
          <span className="h-4 w-1/3 animate-pulse rounded bg-surface" />
        </li>
      ))}
    </ul>
  );
}

function LoadingTailors() {
  const t = useTranslations("Saved");

  return (
    <ul
      aria-busy="true"
      aria-label={t("loadingTailors")}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {[0, 1].map((item) => (
        <li key={item} className="h-40 animate-pulse rounded-card bg-surface" />
      ))}
    </ul>
  );
}

function useLoaded<Item extends { id: string }>(
  ids: string[],
  load: (ids: string[]) => Promise<Item[]>,
) {
  const [loaded, setLoaded] = useState<Loaded<Item> | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;
    if (loaded && ids.every((id) => loaded.requested.includes(id))) return;

    let cancelled = false;
    load(ids)
      .then((items) => {
        if (!cancelled) setLoaded({ requested: ids, items });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ requested: ids, items: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [ids, loaded, load]);

  const byId = new Map(loaded?.items.map((item) => [item.id, item]));

  return {
    items: ids.flatMap((id) => byId.get(id) ?? []),
    loading:
      ids.length > 0 && !ids.every((id) => loaded?.requested.includes(id)),
  };
}

export function SavedItems() {
  const t = useTranslations("Saved");
  const saved = useSaved();
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [tab, setTab] = useState("garments");
  const garments = useLoaded(saved.garments, loadSavedGarments);
  const tailors = useLoaded(saved.tailors, loadSavedTailors);
  const garmentsLoading = !hydrated || garments.loading;
  const tailorsLoading = !hydrated || tailors.loading;

  return (
    <div className="mt-5 flex flex-col gap-5 lg:mt-8">
      <div className="lg:max-w-md">
        <SegmentedControl
          label={t("tabs")}
          fullWidth
          defaultValue="garments"
          onChange={setTab}
          options={[
            {
              value: "garments",
              label: t("garments"),
              count: garmentsLoading ? undefined : garments.items.length,
            },
            {
              value: "tailors",
              label: t("tailors"),
              count: tailorsLoading ? undefined : tailors.items.length,
            },
          ]}
        />
      </div>

      {tab === "tailors" ? (
        tailorsLoading ? (
          <LoadingTailors />
        ) : tailors.items.length === 0 ? (
          <EmptySaved kind="tailors" />
        ) : (
          <TailorList tailors={tailors.items} />
        )
      ) : garmentsLoading ? (
        <LoadingGrid />
      ) : garments.items.length === 0 ? (
        <EmptySaved kind="garments" />
      ) : (
        <ul className={gridClasses}>
          {garments.items.map((garment) => (
            <li key={garment.id} className="relative">
              <GarmentCard garment={garment} />
              <SaveButton
                garmentId={garment.id}
                size="md"
                shape="circle"
                className="absolute top-2 right-2 shadow-sm"
              />
            </li>
          ))}
        </ul>
      )}

      {tab === "garments" && garments.items.length > 0 && (
        <p className="flex gap-3 rounded-card bg-haze p-4 text-caption text-ink-soft lg:max-w-2xl">
          <Info className="mt-0.5 size-4 shrink-0 text-secondary" />
          <span>
            {t.rich("note", {
              strong: (chunks) => (
                <strong className="font-semibold text-ink">{chunks}</strong>
              ),
            })}
          </span>
        </p>
      )}
    </div>
  );
}
