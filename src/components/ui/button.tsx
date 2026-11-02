import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-brand font-semibold text-ink hover:bg-brand-light",
  dark: "bg-ink font-semibold text-white hover:bg-ink-soft",
  outline: "border border-ink font-medium text-ink hover:bg-mist",
  secondary: "bg-mist font-medium text-ink hover:bg-line-soft",
  soft: "bg-brand-50 font-medium text-ink hover:bg-brand-100",
  ghost: "font-semibold text-teal hover:bg-brand-50",
  danger: "bg-danger font-semibold text-white hover:bg-danger/90",
};

const sizes = {
  sm: "h-10 rounded-lg px-4 text-sm",
  md: "h-12 rounded-lg px-5 text-base",
  lg: "h-[52px] rounded-card px-6 text-base",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type ButtonStyle = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyle = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:border-transparent disabled:bg-line-soft disabled:text-muted [&_svg]:size-[18px]",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & Omit<ButtonStyle, "className">;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
