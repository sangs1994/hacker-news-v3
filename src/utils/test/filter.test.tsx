import { withinRange } from "../filters";
import type { TimeRange } from "../../types";

describe("withinRange", () => {
  const NOW = 1_700_000_000_000; // fixed timestamp in ms

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function secondsAgo(msAgo: number) {
    return Math.floor((NOW - msAgo) / 1000);
  }

  test("returns true for 1d when within 24 hours", () => {
    const oneHourAgo = secondsAgo(60 * 60 * 1000);
    expect(withinRange(oneHourAgo, "1d")).toBe(true);
  });

  test("returns false for 1d when older than 24 hours", () => {
    const twoDaysAgo = secondsAgo(2 * 24 * 60 * 60 * 1000);
    expect(withinRange(twoDaysAgo, "1d")).toBe(false);
  });

  test("returns true for 1m when within 30 days", () => {
    const tenDaysAgo = secondsAgo(10 * 24 * 60 * 60 * 1000);
    expect(withinRange(tenDaysAgo, "1m")).toBe(true);
  });

  test("returns false for 1m when older than 30 days", () => {
    const fortyDaysAgo = secondsAgo(40 * 24 * 60 * 60 * 1000);
    expect(withinRange(fortyDaysAgo, "1m")).toBe(false);
  });

  test("returns true for fallback (1y) when within 365 days", () => {
    const twoHundredDaysAgo = secondsAgo(200 * 24 * 60 * 60 * 1000);
    expect(withinRange(twoHundredDaysAgo, "1y" as TimeRange)).toBe(true);
  });

  test("returns false for fallback (1y) when older than 365 days", () => {
    const fourHundredDaysAgo = secondsAgo(400 * 24 * 60 * 60 * 1000);
    expect(withinRange(fourHundredDaysAgo, "1y" as TimeRange)).toBe(false);
  });

  test("boundary: exactly 24 hours ago is included in 1d", () => {
    const exactlyOneDayAgo = secondsAgo(24 * 60 * 60 * 1000);
    expect(withinRange(exactlyOneDayAgo, "1d")).toBe(true);
  });

  test("boundary: exactly 30 days ago is included in 1m", () => {
    const exactlyThirtyDaysAgo = secondsAgo(30 * 24 * 60 * 60 * 1000);
    expect(withinRange(exactlyThirtyDaysAgo, "1m")).toBe(true);
  });
});
