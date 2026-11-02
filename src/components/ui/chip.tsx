import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ChipProps = {
  children: ReactNode;
  variant?: "brand" | "pill";
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
};

export function Chip({
  children,
  variant = "brand",
  onRemove,
  removeLabel = "Remove",
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[34px] items-center gap-1.5 text-sm whitespace-nowrap",
        variant === "brand"
          ? "rounded-md bg-brand-50 font-medium text-teal"
          : "rounded-full border border-haze-line bg-haze font-semibold text-ink",
        onRemove ? "pr-1.5 pl-3" : "px-3.5",
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="inline-flex size-6 items-center justify-center rounded text-teal transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-teal"
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}
