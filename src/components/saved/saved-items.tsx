"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { GarmentCard } from "@/components/garments/garment-card";
import { Placeholder } from "@/components/layout/placeholder";
import { SaveButton } from "@/components/story/save-button";
import { buttonClasses } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { loadSavedGarments } from "@/lib/discover/actions";
import { useSaved } from "@/lib/discover/saved";
import type { FeedGarment } from "@/lib/garments";

type Loaded = { requested: string[]; garments: FeedGarment[] };

const gridClasses =
  "grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10";

function subscribeNever() {
  return () => {};
}

function EmptySaved() {
  const t = useTranslations("Saved");

  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-teal">
        <Heart className="size-6" />
      </span>
      <h2 className="text-section">{t("emptyTitle")}</h2>
      <p className="max-w-sm text-body text-secondary">{t("emptyBody")}</p>
      <Link
        href="/garments"
        className={buttonClasses({ size: "md", className: "mt-2" })}
      >
        {t("discover")}
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

export function SavedItems() {
  const t = useTranslations("Saved");
  const saved = useSaved();
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [tab, setTab] = useState("garments");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const ids = saved.garments;

  useEffect(() => {
    if (ids.length === 0) return;
    if (loaded && ids.every((id) => loaded.requested.includes(id))) return;

    let cancelled = false;
    loadSavedGarments(ids)
      .then((garments) => {
        if (!cancelled) setLoaded({ requested: ids, garments });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ requested: ids, garments: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [ids, loaded]);

  const byId = new Map(
    loaded?.garments.map((garment) => [garment.id, garment]),
  );
  const garments = ids.flatMap((id) => byId.get(id) ?? []);
  const loading =
    !hydrated ||
    (ids.length > 0 && !ids.every((id) => loaded?.requested.includes(id)));

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
              count: loading ? undefined : garments.length,
            },
            {
              value: "tailors",
              label: t("tailors"),
              count: saved.tailors.length,
            },
          ]}
        />
      </div>

      {tab === "tailors" ? (
        <div className="lg:max-w-2xl">
          <Placeholder milestone={8} description={t("tailorsSoon")} />
        </div>
      ) : loading ? (
        <LoadingGrid />
      ) : garments.length === 0 ? (
        <EmptySaved />
      ) : (
        <ul className={gridClasses}>
          {garments.map((garment) => (
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

      {tab === "garments" && garments.length > 0 && (
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
