import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FieldControlProps = {
  id: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const message = error ?? hint;
  const messageId = message ? `${id}-message` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {" "}
            *
          </span>
        )}
      </label>
      {children({
        id,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": messageId,
      })}
      {message && (
        <p
          id={messageId}
          className={cn(
            "text-caption",
            error ? "text-danger" : "text-secondary",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
