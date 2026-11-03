import type { ReactNode } from "react";
import { ParticipantLink } from "@/components/layout/participant-link";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ParticipantLink />
      <SiteHeader />
      {children}
    </>
  );
}
