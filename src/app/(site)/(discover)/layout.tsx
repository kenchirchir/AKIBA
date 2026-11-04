import type { ReactNode } from "react";
import { BuyerHeader } from "@/components/layout/buyer-header";

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BuyerHeader />
      {children}
    </>
  );
}
