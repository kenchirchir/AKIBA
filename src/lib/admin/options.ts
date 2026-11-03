export const rejectReasons = [
  "photos",
  "story",
  "notMadeByTailor",
  "details",
  "other",
] as const;

export type RejectReason = (typeof rejectReasons)[number];

export const tailorStatuses = ["pending", "verified", "suspended"] as const;

export type TailorStatus = (typeof tailorStatuses)[number];
