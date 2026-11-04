import type { ReactNode } from "react";
import { ParticipantLink } from "@/components/layout/participant-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ParticipantLink />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
