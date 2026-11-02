"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

const longStory = 320;

export function StoryText({ text }: { text: string }) {
  const t = useTranslations("GarmentStory");
  const id = useId();
  const [open, setOpen] = useState(false);
  const long = text.length > longStory;

  return (
    <div className="flex flex-col items-start gap-2">
      <p
        id={id}
        className={cn(
          "text-body whitespace-pre-line text-ink-soft",
          long && !open && "line-clamp-5",
        )}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="text-label font-semibold text-teal underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {open ? t("readLess") : t("readMore")}
        </button>
      )}
    </div>
  );
}
