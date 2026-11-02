import type { ReactNode } from "react";
import { RailShell } from "@/components/layout/rail-shell";
import { TailorMenu } from "@/components/layout/tailor-menu";
import { requireTailor } from "@/lib/tailor";

export default async function ShopHomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tailor = await requireTailor();

  return (
    <RailShell menu={<TailorMenu tailor={tailor} />} showSaved={false}>
      {children}
    </RailShell>
  );
}
