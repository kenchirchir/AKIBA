import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { Container } from "./container";

const linkClasses =
  "w-fit text-sm text-secondary transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

type FooterLink = { href: string; label: string };

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClasses}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const t = useTranslations("Footer");
  const common = useTranslations("Common");

  return (
    <footer className="border-t border-line-soft bg-white">
      <Container className="flex flex-col gap-10 py-10 lg:flex-row lg:justify-between lg:gap-16 lg:py-14">
        <div className="flex max-w-xs flex-col gap-3">
          <Link
            href="/"
            aria-label={common("home")}
            className="w-fit rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <Logo variant="bold" />
          </Link>
          <p className="text-sm text-secondary">{t("tagline")}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:gap-16">
          <FooterColumn
            title={t("discover")}
            links={[
              { href: "/garments", label: t("garments") },
              { href: "/tailors", label: t("tailors") },
              { href: "/saved", label: t("saved") },
            ]}
          />
          <FooterColumn
            title={t("forTailors")}
            links={[
              { href: "/join", label: t("join") },
              { href: "/login", label: t("login") },
            ]}
          />
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <h2 className="text-sm font-semibold text-ink">{t("help")}</h2>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/terms" className={linkClasses}>
                  {t("terms")}
                </Link>
              </li>
              <li>
                <a href={`mailto:${t("email")}`} className={linkClasses}>
                  {t("email")}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t("phone").replace(/\s/g, "")}`}
                  className={linkClasses}
                >
                  {t("phone")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
      <Container className="border-t border-line-soft py-5">
        <p className="text-caption text-secondary">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </Container>
    </footer>
  );
}
