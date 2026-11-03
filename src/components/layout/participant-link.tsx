"use client";

import { useEffect } from "react";

export function ParticipantLink() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("p");
    if (!code) return;

    fetch("/api/participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      keepalive: true,
    }).catch(() => undefined);

    url.searchParams.delete("p");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return null;
}
