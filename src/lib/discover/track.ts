export type TrackedEvent =
  | { type: "story_view" | "save" | "unsave"; garmentId: string }
  | { type: "story_read"; garmentId: string; seconds: number }
  | { type: "tailor_view" | "directions_click"; tailorId: string };

const endpoint = "/api/events";

export function track(event: TrackedEvent, leaving = false) {
  const body = JSON.stringify(event);

  if (leaving && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(endpoint, body);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
