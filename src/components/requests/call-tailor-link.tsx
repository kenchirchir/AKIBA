"use client";

import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { track } from "@/lib/discover/track";

type CallTailorLinkProps = {
  phone: string;
  garmentId: string;
  children: ReactNode;
};

export function CallTailorLink({
  phone,
  garmentId,
  children,
}: CallTailorLinkProps) {
  return (
    <a
      href={`tel:${phone}`}
      onClick={() => track({ type: "call_click", garmentId })}
      className={buttonClasses({
        variant: "outline",
        size: "lg",
        fullWidth: true,
      })}
    >
      <Phone />
      {children}
    </a>
  );
}
