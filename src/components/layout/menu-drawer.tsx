"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function MenuDrawer({ children }: { children: ReactNode }) {
  const t = useTranslations("Menu");
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={t("open")}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-ink"
      >
        <Plus strokeWidth={1.25} className="size-8" />
      </button>
      <dialog
        ref={ref}
        aria-label={t("label")}
        onClose={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) {
            setOpen(false);
          }
        }}
        className="mr-auto ml-0 h-dvh max-h-none w-full max-w-full bg-brand text-ink backdrop:bg-ink/40 md:max-w-[420px]"
      >
        <div className="relative flex min-h-full flex-col py-6 pr-12 pl-5">
          {children}
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="absolute top-1/2 right-0 flex size-12 -translate-y-1/2 items-center justify-center text-ink transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <X strokeWidth={1.25} className="size-8" />
          </button>
        </div>
      </dialog>
    </>
  );
}
