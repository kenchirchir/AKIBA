import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";

export function LogoBar() {
  const t = useTranslations("Common");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-line-soft bg-white px-5 md:px-6 lg:hidden">
      <Link
        href="/"
        aria-label={t("home")}
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        <Logo variant="bold" />
      </Link>
    </header>
  );
}
