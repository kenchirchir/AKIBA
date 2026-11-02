"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";

type Option = {
  value: string;
  label: string;
  count?: number;
};

type SegmentedControlProps = {
  label: string;
  options: Option[];
  defaultValue: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
};

export function SegmentedControl({
  label,
  options,
  defaultValue,
  onChange,
  fullWidth = false,
}: SegmentedControlProps) {
  const [value, setValue] = useState(defaultValue);

  function select(next: string) {
    setValue(next);
    onChange?.(next);
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "gap-1 bg-mist",
        fullWidth
          ? "flex w-full rounded-card p-1"
          : "inline-flex rounded-lg p-[3px]",
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => select(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-teal",
              fullWidth ? "h-10 flex-1 rounded-lg" : "h-[30px] rounded-md",
              selected
                ? "bg-white font-semibold text-ink shadow-sm"
                : "font-medium text-prose hover:text-ink",
            )}
          >
            {option.label}
            {option.count ? (
              <Badge variant="count">{option.count}</Badge>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
