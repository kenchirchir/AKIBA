import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  brand: "bg-brand-50 text-teal",
  success: "bg-success-50 text-success-ink",
  warning: "bg-warning-50 text-warning-ink",
  danger: "bg-white text-danger",
  neutral: "bg-mist text-ink",
  outline: "border border-line bg-white text-ink",
  count: "bg-alert text-white",
};

type BadgeProps = {
  variant?: keyof typeof tones;
  className?: string;
  children: ReactNode;
};

export function Badge({ variant = "brand", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        variant === "count"
          ? "h-4 min-w-5 justify-center px-1.5 text-micro"
          : "h-6 px-2.5 text-caption",
        tones[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
