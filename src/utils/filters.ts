import type { TimeRange } from "../types/index";

export function withinRange(unixSeconds: number, range: TimeRange): boolean {
  const ageMs = Date.now() - unixSeconds * 1000;
  const day = 24 * 60 * 60 * 1000;

  if (range === "1d") return ageMs <= day;
  if (range === "1m") return ageMs <= 30 * day;
  return ageMs <= 365 * day;
}
