import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { LogoBar } from "@/components/layout/logo-bar";

const sections = [
  "about",
  "buyers",
  "tailors",
  "requests",
  "research",
  "cookies",
  "storage",
  "rights",
] as const;

const linkClasses =
  "font-semibold text-teal underline underline-offset-2 hover:text-teal-dark";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  return { title: t("title"), description: t("intro") };
}

export default function TermsPage() {
  const t = useTranslations("Terms");

  return (
    <main className="flex-1">
      <LogoBar />
      <Container className="pt-4 pb-16 lg:pt-10">
        <h1 className="text-title lg:text-[36px]">{t("title")}</h1>
        <p className="mt-1 text-caption text-secondary">{t("updated")}</p>
        <p className="mt-4 text-body text-ink-soft lg:max-w-3xl">
          {t("intro")}
        </p>
        <div className="mt-8 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-12">
          <nav
            aria-label={t("contents")}
            className="hidden lg:sticky lg:top-28 lg:block"
          >
            <p className="text-label text-secondary">{t("contents")}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {sections.map((section) => (
                <li key={section}>
                  <a
                    href={`#${section}`}
                    className="text-sm font-medium text-ink hover:text-teal hover:underline"
                  >
                    {t(`sections.${section}.title`)}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="text-sm font-medium text-ink hover:text-teal hover:underline"
                >
                  {t("contactTitle")}
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col gap-8 lg:max-w-3xl">
            {sections.map((section) => {
              const points = t.raw(`sections.${section}.points`) as string[];

              return (
                <section
                  key={section}
                  id={section}
                  className="scroll-mt-6 lg:scroll-mt-28"
                >
                  <h2 className="text-section">
                    {t(`sections.${section}.title`)}
                  </h2>
                  <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-ink-soft marker:text-brand">
                    {points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </section>
              );
            })}
            <section id="contact" className="scroll-mt-6 lg:scroll-mt-28">
              <h2 className="text-section">{t("contactTitle")}</h2>
              <p className="mt-3 text-body text-ink-soft">
                {t.rich("contactLine", {
                  email: (chunks) => (
                    <a
                      href="mailto:kenchirchir2004@gmail.com"
                      className={linkClasses}
                    >
                      {chunks}
                    </a>
                  ),
                  phone: (chunks) => (
                    <a href="tel:+250794096359" className={linkClasses}>
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
