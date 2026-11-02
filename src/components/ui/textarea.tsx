import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { controlClasses } from "./input";

export function Textarea({
  className,
  rows = 4,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn("min-h-24 resize-y px-4 py-3", controlClasses, className)}
      {...props}
    />
  );
}
