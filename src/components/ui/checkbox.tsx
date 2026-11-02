import type { ComponentProps, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
};

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 text-label font-normal text-secondary",
        className,
      )}
    >
      <span className="relative inline-flex size-[18px] shrink-0">
        <input
          type="checkbox"
          className="peer size-[18px] cursor-pointer appearance-none rounded border border-muted bg-white transition-colors checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          {...props}
        />
        <Check
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto hidden size-3 text-ink peer-checked:block"
        />
      </span>
      {label}
    </label>
  );
}
