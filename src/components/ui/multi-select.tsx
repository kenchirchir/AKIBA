"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Checkbox } from "./checkbox";
import { Chip } from "./chip";
import { controlClasses } from "./input";

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  id: string;
  name: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  summary: string;
  removeLabel: (label: string) => string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

export function MultiSelect({
  id,
  name,
  options,
  value,
  onChange,
  summary,
  removeLabel,
  ...aria
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = `${id}-options`;

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function toggle(option: string) {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  }

  const selected = options.filter((option) => value.includes(option.value));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-[46px] items-center justify-between px-4 text-left",
          controlClasses,
        )}
        {...aria}
      >
        <span className={selected.length === 0 ? "text-placeholder" : ""}>
          {summary}
        </span>
        <ChevronDown className="size-[18px] shrink-0 text-secondary" />
      </button>
      {open && (
        <div
          id={listId}
          role="group"
          aria-labelledby={id}
          className="absolute z-20 mt-1 flex w-full flex-col rounded-lg border border-line bg-white p-1.5 shadow-lg"
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              tone="default"
              label={option.label}
              checked={value.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="min-h-11 w-full rounded-md px-2.5 hover:bg-mist"
            />
          ))}
        </div>
      )}
      {selected.map((option) => (
        <input
          key={option.value}
          type="hidden"
          name={name}
          value={option.value}
        />
      ))}
      {selected.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {selected.map((option) => (
            <Chip
              key={option.value}
              removeLabel={removeLabel(option.label)}
              onRemove={() => toggle(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
