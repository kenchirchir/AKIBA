import type { ReactNode } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TailorMenu } from "@/components/layout/tailor-menu";
import { Avatar } from "@/components/ui/avatar";
import { requireTailor } from "@/lib/tailor";

export default async function ShopHomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tailor = await requireTailor();

  return (
    <>
      <MobileHeader
        homeHref="/shop"
        menu={<TailorMenu tailor={tailor} />}
        end={
          <Avatar
            name={tailor.shop_name}
            publicId={tailor.avatar_public_id}
            size="sm"
          />
        }
      />
      {children}
    </>
  );
}
