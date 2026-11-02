import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type PriceInputProps = Omit<ComponentProps<"input">, "type">;

export function PriceInput({ className, ...props }: PriceInputProps) {
  return (
    <div
      className={cn(
        "flex h-[46px] overflow-hidden rounded-lg border border-line bg-white transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25 has-[input[aria-invalid=true]]:border-danger",
        className,
      )}
    >
      <span className="flex w-[64px] shrink-0 items-center justify-center border-r border-line bg-surface text-base font-semibold text-secondary">
        RWF
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="45,000"
        className="min-w-0 flex-1 bg-transparent px-3 text-base text-ink placeholder:text-placeholder focus:outline-none"
        {...props}
      />
    </div>
  );
}
