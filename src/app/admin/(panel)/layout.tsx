import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { getOverview } from "@/lib/admin/data";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [overview, t] = await Promise.all([
    getOverview(),
    getTranslations("Admin.nav"),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-haze">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-white">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <Logo variant="bold" />
            <Badge variant="neutral">{t("admin")}</Badge>
          </Link>
          <LogoutButton className="ml-auto cursor-pointer text-label font-semibold text-danger hover:underline md:order-last">
            {t("logout")}
          </LogoutButton>
          <div className="w-full md:w-auto">
            <AdminNav
              pendingTailors={overview.pendingTailors}
              pendingGarments={overview.pendingGarments}
            />
          </div>
        </Container>
      </header>
      <main className="flex-1">
        <Container className="py-6 lg:py-10">{children}</Container>
      </main>
    </div>
  );
}
