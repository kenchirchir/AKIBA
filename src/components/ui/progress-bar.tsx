import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  label: string;
  className?: string;
};

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-track",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-success"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
