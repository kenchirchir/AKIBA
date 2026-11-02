import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";

export function AuthHeader({ title }: { title: string }) {
  const t = useTranslations("Common");

  return (
    <header className="flex items-baseline justify-between gap-4">
      <Link
        href="/"
        aria-label={t("home")}
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        <Logo variant="bold" />
      </Link>
      <h1 className="text-heading">{title}</h1>
    </header>
  );
}
