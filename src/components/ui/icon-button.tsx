import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  soft: "bg-mist text-ink hover:bg-line-soft",
  white: "bg-white text-ink hover:bg-mist",
  outline: "border border-line-soft bg-white text-ink hover:bg-mist",
  brand: "bg-brand-50 text-teal hover:bg-brand-100",
};

const sizes = {
  sm: "size-9 [&_svg]:size-[18px]",
  md: "size-10 [&_svg]:size-5",
  lg: "size-11 [&_svg]:size-5",
};

type IconButtonStyle = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  shape?: "circle" | "square";
  className?: string;
};

export function iconButtonClasses({
  variant = "soft",
  size = "md",
  shape = "circle",
  className,
}: IconButtonStyle = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-50",
    shape === "circle" ? "rounded-full" : "rounded-card",
    variants[variant],
    sizes[size],
    className,
  );
}

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> &
  Omit<IconButtonStyle, "className"> & {
    label: string;
  };

export function IconButton({
  label,
  variant,
  size,
  shape,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={iconButtonClasses({ variant, size, shape, className })}
      {...props}
    />
  );
}
