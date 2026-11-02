"use client";

import { useState, type ChangeEvent } from "react";
import { cn } from "@/lib/cn";

type OtpInputProps = {
  id?: string;
  name?: string;
  length?: number;
  required?: boolean;
  autoFocus?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  onComplete?: (code: string) => void;
};

export function OtpInput({ length = 6, onComplete, ...props }: OtpInputProps) {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(code.length, length - 1);
  const invalid = props["aria-invalid"] === true;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/\D/g, "").slice(0, length);
    setCode(next);
    if (next.length === length) onComplete?.(next);
  }

  return (
    <div className="relative">
      <div aria-hidden="true" className="flex gap-2">
        {Array.from({ length }, (_, index) => (
          <div
            key={index}
            className={cn(
              "flex h-[52px] flex-1 items-center justify-center rounded-lg border bg-white text-xl font-medium text-ink transition-colors",
              invalid
                ? "border-danger"
                : focused && index === activeIndex
                  ? "border-brand ring-2 ring-brand/25"
                  : "border-line",
            )}
          >
            {code[index]}
          </div>
        ))}
      </div>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern={`[0-9]{${length}}`}
        maxLength={length}
        value={code}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 size-full cursor-text text-base caret-transparent opacity-0"
        {...props}
      />
    </div>
  );
}
