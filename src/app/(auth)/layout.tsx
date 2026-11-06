import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import heroImage from "@/assets/welcome-hero.webp";
import { DecorativeCircles } from "@/components/layout/decorative-circles";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("Common");

  return (
    <main className="flex flex-1">
      <div className="relative hidden flex-1 bg-brand md:block">
        <Image
          src={heroImage}
          alt=""
          fill
          placeholder="blur"
          sizes="50vw"
          className="object-cover"
        />
      </div>
      <div className="relative flex flex-1 flex-col overflow-hidden px-6 pt-36 pb-10 md:items-center md:justify-center md:px-10 md:py-16">
        <DecorativeCircles />
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 rounded-full py-2 pr-3 text-sm font-semibold text-ink transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal md:top-8 md:left-10"
        >
          <ArrowLeft strokeWidth={2.25} className="size-5" />
          {t("backHome")}
        </Link>
        <div className="relative w-full md:max-w-md">{children}</div>
      </div>
    </main>
  );
}
