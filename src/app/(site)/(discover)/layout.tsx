import type { ReactNode } from "react";
import { BuyerMenu } from "@/components/layout/buyer-menu";
import { RailShell } from "@/components/layout/rail-shell";

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return <RailShell menu={<BuyerMenu />}>{children}</RailShell>;
}
