import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type SwitchProps = Omit<ComponentProps<"input">, "type" | "role"> & {
  label: string;
};

export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 text-body text-ink",
        className,
      )}
    >
      <span>{label}</span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...props}
        />
        <span className="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal" />
        <span className="absolute top-[3px] left-[3px] size-[22px] rounded-full bg-white shadow-knob transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
