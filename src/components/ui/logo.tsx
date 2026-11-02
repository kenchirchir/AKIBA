import { cn } from "@/lib/cn";

type LogoProps = {
  variant?: "plain" | "block";
  className?: string;
};

export function Logo({ variant = "plain", className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex text-[25px] leading-none font-medium tracking-[0.03em] text-ink",
        variant === "block" && "h-[34px] w-[196px] items-end bg-brand pl-3.5",
        className,
      )}
    >
      akiba
    </span>
  );
}
