import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

export function LogoBar({ className }: { className?: string }) {
  const t = useTranslations("Common");

  return (
    <div
      className={cn("sticky top-0 z-10 flex justify-end lg:hidden", className)}
    >
      <Link
        href="/"
        aria-label={t("home")}
        className="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
      >
        <Logo variant="block" />
      </Link>
    </div>
  );
}
