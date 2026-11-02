import type { ReactNode } from "react";
import { RailShell } from "@/components/layout/rail-shell";
import { TailorMenu } from "@/components/layout/tailor-menu";

export default function ShopHomeLayout({ children }: { children: ReactNode }) {
  return (
    <RailShell menu={<TailorMenu />} showSaved={false}>
      {children}
    </RailShell>
  );
}
