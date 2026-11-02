"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { controlClasses } from "./input";

type PinInputProps = Omit<ComponentProps<"input">, "type"> & {
  clear?: boolean;
};

export function PinInput({
  className,
  clear = false,
  ...props
}: PinInputProps) {
  const t = useTranslations("Common");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clear && ref.current) ref.current.value = "";
  }, [clear]);

  return (
    <div className="relative">
      <input
        ref={ref}
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
        aria-label={t("showPin")}
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
