import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type PlaceholderProps = {
  milestone: number;
  description: string;
  children?: ReactNode;
};

export function Placeholder({
  milestone,
  description,
  children,
}: PlaceholderProps) {
  const t = useTranslations("Placeholder");

  return (
    <section className="flex flex-col gap-4 rounded-card border border-dashed border-line bg-surface p-5">
      <Badge className="self-start">{t("comingIn", { milestone })}</Badge>
      <p className="text-body text-secondary">{description}</p>
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </section>
  );
}
