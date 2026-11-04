import { cn } from "@/lib/cn";

type LogoProps = {
  variant?: "plain" | "bold";
  className?: string;
};

export function Logo({ variant = "plain", className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex leading-none text-ink",
        variant === "bold"
          ? "text-[22px] font-bold tracking-[-0.01em]"
          : "text-[25px] font-medium tracking-[0.03em]",
        className,
      )}
    >
      Akiba
    </span>
  );
}
