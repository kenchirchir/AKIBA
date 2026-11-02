import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClasses } from "./input";

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-[46px] appearance-none pr-11 pl-4 invalid:text-placeholder [&_option]:text-ink",
          controlClasses,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-secondary" />
    </div>
  );
}
