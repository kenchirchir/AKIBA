"use client";

import { useEffect } from "react";
import { track } from "@/lib/discover/track";

const maxSeconds = 3600;

export function StoryTracker({ garmentId }: { garmentId: string }) {
  useEffect(() => {
    track({ type: "story_view", garmentId });

    let visibleSince =
      document.visibilityState === "visible" ? Date.now() : null;

    function flush(leaving: boolean) {
      if (visibleSince === null) return;
      const seconds = Math.min(
        Math.round((Date.now() - visibleSince) / 1000),
        maxSeconds,
      );
      visibleSince = null;
      if (seconds >= 1) {
        track({ type: "story_read", garmentId, seconds }, leaving);
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flush(true);
      else visibleSince = Date.now();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      flush(false);
    };
  }, [garmentId]);

  return null;
}
