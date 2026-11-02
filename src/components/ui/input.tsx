import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const controlClasses =
  "w-full rounded-lg border border-line bg-white text-base text-ink transition-colors placeholder:text-placeholder focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none disabled:bg-surface disabled:text-muted aria-[invalid=true]:border-danger";

export function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn("h-[46px] px-4", controlClasses, className)}
      {...props}
    />
  );
}
