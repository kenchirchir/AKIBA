import type { ReactNode } from "react";
import { TailorSidebar } from "@/components/layout/tailor-sidebar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      <TailorSidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:bg-haze">{children}</div>
    </div>
  );
}
