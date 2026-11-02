"use client";

import Image from "next/image";
import { Camera, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CloudImage } from "@/components/ui/cloud-image";
import { cn } from "@/lib/cn";
import type { PhotoItem } from "./use-photo-uploads";

type PhotoPickerProps = {
  items: PhotoItem[];
  full: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
};

const tileClasses =
  "relative aspect-square overflow-hidden rounded-card lg:first:col-span-4 lg:first:aspect-[4/3]";

export function PhotoPicker({
  items,
  full,
  error,
  onAdd,
  onRemove,
  onRetry,
}: PhotoPickerProps) {
  const t = useTranslations("GarmentForm");

  return (
    <div data-field="photos" className="flex flex-col gap-2.5">
      <p className="text-label text-ink lg:text-section">
        {t("photos")}{" "}
        <span className="font-normal text-secondary">{t("photosLimit")}</span>
        <span aria-hidden="true" className="text-danger">
          {" "}
          *
        </span>
      </p>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-4 lg:gap-3">
        {items.map((item, index) => {
          const alt = t("photoAlt", { number: index + 1 });
          const sizes =
            index === 0
              ? "(min-width: 1024px) 560px, 33vw"
              : "(min-width: 1024px) 140px, 33vw";

          return (
            <li key={item.key} className={cn(tileClasses, "bg-surface")}>
              {item.preview ? (
                <Image
                  src={item.preview}
                  alt={alt}
                  fill
                  sizes={sizes}
                  className="object-cover"
                />
              ) : (
                item.photo && (
                  <CloudImage
                    publicId={item.photo.publicId}
                    alt={alt}
                    fill
                    sizes={sizes}
                    className="object-cover"
                  />
                )
              )}
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded-md bg-ink/80 px-2 py-0.5 text-micro font-semibold text-white">
                  {t("cover")}
                </span>
              )}
              {item.status === "uploading" && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/45 px-3 text-micro font-semibold text-white">
                  {t("uploading", { percent: item.progress })}
                  <span className="h-1 w-full max-w-24 overflow-hidden rounded-full bg-white/30">
                    <span
                      className="block h-full rounded-full bg-white transition-[width]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </span>
                </span>
              )}
              {item.status === "failed" && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/65 px-2 text-center text-micro font-semibold text-white">
                  {t("failed")}
                  <button
                    type="button"
                    onClick={() => onRetry(item.key)}
                    className="rounded-full bg-white px-3 py-1 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t("retry")}
                  </button>
                </span>
              )}
              <button
                type="button"
                aria-label={t("removePhoto", { number: index + 1 })}
                onClick={() => onRemove(item.key)}
                className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-teal"
              >
                <X className="size-4" />
              </button>
            </li>
          );
        })}
        {!full && (
          <li className={tileClasses}>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "photos-message" : undefined}
              onChange={(event) => {
                onAdd(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
              className="peer sr-only"
            />
            <label
              htmlFor="photos"
              className="flex size-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-brand/60 bg-haze text-label font-semibold text-teal transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-teal peer-aria-[invalid=true]:border-danger hover:bg-brand-50"
            >
              <Camera className="size-5" />
              {t("addPhoto")}
            </label>
          </li>
        )}
      </ul>
      <p className="hidden text-caption text-secondary lg:block">
        {t("photosHint")}
      </p>
      {error && (
        <p id="photos-message" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
