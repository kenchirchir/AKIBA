import type { ReactNode } from "react";
import { TailorSidebar } from "@/components/layout/tailor-sidebar";
import { requireTailor } from "@/lib/tailor";

export default async function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tailor = await requireTailor();

  return (
    <div className="flex flex-1">
      <TailorSidebar tailor={tailor} />
      <div className="flex min-w-0 flex-1 flex-col lg:bg-haze">{children}</div>
    </div>
  );
}
