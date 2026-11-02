"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./icon-button";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-full overflow-y-auto rounded-t-sheet bg-white text-ink shadow-sheet backdrop:bg-ink/50 sm:mb-auto sm:max-w-md sm:rounded-sheet"
    >
      <div className="px-5 pt-2 pb-8">
        <div className="mx-auto h-1 w-10 rounded-full bg-line" />
        <div className="mt-5 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-subheading">
            {title}
          </h2>
          <IconButton label="Close" size="sm" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
