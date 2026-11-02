"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClasses } from "./input";

type PinInputProps = Omit<ComponentProps<"input">, "type">;

export function PinInput({ className, ...props }: PinInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        inputMode="numeric"
        pattern="[0-9]{5}"
        maxLength={5}
        autoComplete="current-password"
        placeholder="•••••"
        className={cn(
          "h-[46px] pr-12 pl-4 tracking-[0.3em]",
          controlClasses,
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label="Show PIN"
        aria-pressed={visible}
        className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-secondary transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-teal"
      >
        {visible ? (
          <EyeOff className="size-[18px]" />
        ) : (
          <Eye className="size-[18px]" />
        )}
      </button>
    </div>
  );
}
