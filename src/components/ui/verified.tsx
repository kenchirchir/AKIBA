import { BadgeCheck, CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export function VerifiedIcon({ className }: { className?: string }) {
  return (
    <BadgeCheck
      role="img"
      aria-label="Verified"
      className={cn("size-4 shrink-0 fill-brand text-white", className)}
    />
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-caption font-bold text-teal-dark",
        className,
      )}
    >
      <CircleCheck className="size-3.5" />
      Verified tailor
    </span>
  );
}
