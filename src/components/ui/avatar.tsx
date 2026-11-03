import { cn } from "@/lib/cn";
import { CloudImage } from "./cloud-image";

const sizes = {
  xs: { box: "size-6 text-[10px]", pixels: 24 },
  sm: { box: "size-8 text-micro", pixels: 32 },
  md: { box: "size-11 text-sm", pixels: 44 },
  lg: { box: "size-14 text-base", pixels: 56 },
  xl: { box: "size-24 text-2xl", pixels: 96 },
};

type AvatarProps = {
  name: string;
  publicId?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  publicId,
  size = "md",
  className,
}: AvatarProps) {
  const { box, pixels } = sizes[size];

  if (publicId) {
    return (
      <CloudImage
        publicId={publicId}
        alt={name}
        width={pixels}
        height={pixels}
        className={cn("shrink-0 rounded-full object-cover", box, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-teal",
        box,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
