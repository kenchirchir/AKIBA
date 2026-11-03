"use client";

import { useEffect } from "react";
import { track } from "@/lib/discover/track";

export function TailorTracker({ tailorId }: { tailorId: string }) {
  useEffect(() => {
    track({ type: "tailor_view", tailorId });
  }, [tailorId]);

  return null;
}
