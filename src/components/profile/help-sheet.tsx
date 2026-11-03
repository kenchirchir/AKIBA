"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const questions = ["requests", "payments", "ordered"] as const;

export function HelpSheet({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const t = useTranslations("Profile.help");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("title")}
      >
        <div className="flex flex-col gap-2">
          {questions.map((question) => (
            <details
              key={question}
              className="group rounded-card border border-line-soft px-4"
            >
              <summary className="flex h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-teal [&::-webkit-details-marker]:hidden">
                {t(`${question}.question`)}
                <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-4 text-body text-ink-soft">
                {t(`${question}.answer`)}
              </p>
            </details>
          ))}
          <Link
            href="/terms"
            className="mt-2 flex h-12 items-center justify-between rounded-card border border-line-soft px-4 text-sm font-medium text-ink hover:bg-mist"
          >
            {t("terms")}
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </BottomSheet>
    </>
  );
}
