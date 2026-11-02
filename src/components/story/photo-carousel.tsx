"use client";

import { useEffect, useRef, useState } from "react";
import { Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { CloudImage } from "@/components/ui/cloud-image";
import { cn } from "@/lib/cn";
import type { Photo } from "@/lib/photos";

type PhotoCarouselProps = {
  name: string;
  photos: Photo[];
};

export function PhotoCarousel({ name, photos }: PhotoCarouselProps) {
  const t = useTranslations("GarmentStory");
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [coverShown, setCoverShown] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list || photos.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { root: list, threshold: 0.6 },
    );

    for (const item of list.children) observer.observe(item);
    return () => observer.disconnect();
  }, [photos.length]);

  function show(index: number) {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ left: index * list.clientWidth, behavior: "smooth" });
  }

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-brand-100 text-teal md:rounded-card">
        <Shirt strokeWidth={1} className="size-16 lg:size-24" />
        <span className="sr-only">{t("noPhoto")}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <ul
        ref={listRef}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto md:snap-none md:flex-col md:gap-4 md:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, index) => (
          <li
            key={photo.publicId}
            data-index={index}
            className="relative aspect-[4/5] w-full shrink-0 snap-start overflow-hidden bg-surface md:rounded-card"
          >
            {(index === 0 || coverShown || index === active) && (
              <CloudImage
                publicId={photo.publicId}
                alt={t("photoAlt", {
                  name,
                  number: index + 1,
                  total: photos.length,
                })}
                fill
                preload={index === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                onLoad={index === 0 ? () => setCoverShown(true) : undefined}
                onError={index === 0 ? () => setCoverShown(true) : undefined}
                className={cn(
                  photo.width > photo.height
                    ? "object-contain"
                    : "object-cover",
                )}
              />
            )}
          </li>
        ))}
      </ul>
      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center md:hidden">
          {photos.map((photo, index) => (
            <button
              key={photo.publicId}
              type="button"
              aria-label={t("showPhoto", { number: index + 1 })}
              aria-current={index === active}
              onClick={() => show(index)}
              className="flex h-6 items-center px-1 focus-visible:outline-2 focus-visible:outline-teal"
            >
              <span
                className={cn(
                  "h-2 rounded-full shadow-sm transition-all",
                  index === active ? "w-6 bg-brand" : "w-2 bg-white",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
