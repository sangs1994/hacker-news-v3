import { timeAgo } from "../time";

describe("timeAgo", () => {
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

  test("returns minutes when under 60 minutes", () => {
    const tenMinsAgo = secondsAgo(10 * 60 * 1000);
    expect(timeAgo(tenMinsAgo)).toBe("10m ago");
  });

  test("boundary: 59 minutes", () => {
    const fiftyNineMinsAgo = secondsAgo(59 * 60 * 1000);
    expect(timeAgo(fiftyNineMinsAgo)).toBe("59m ago");
  });

  test("boundary: 60 minutes becomes 1 hour", () => {
    const sixtyMinsAgo = secondsAgo(60 * 60 * 1000);
    expect(timeAgo(sixtyMinsAgo)).toBe("1h ago");
  });

  test("returns hours when under 24 hours", () => {
    const fiveHoursAgo = secondsAgo(5 * 60 * 60 * 1000);
    expect(timeAgo(fiveHoursAgo)).toBe("5h ago");
  });

  test("boundary: 23 hours", () => {
    const twentyThreeHoursAgo = secondsAgo(23 * 60 * 60 * 1000);
    expect(timeAgo(twentyThreeHoursAgo)).toBe("23h ago");
  });

  test("boundary: 24 hours becomes 1 day", () => {
    const twentyFourHoursAgo = secondsAgo(24 * 60 * 60 * 1000);
    expect(timeAgo(twentyFourHoursAgo)).toBe("1d ago");
  });

  test("returns days when 2+ days", () => {
    const threeDaysAgo = secondsAgo(3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });

  test("rounding: 1 day + 23 hours still shows 1 day (floor)", () => {
    const almostTwoDaysAgo = secondsAgo((1 * 24 + 23) * 60 * 60 * 1000);
    expect(timeAgo(almostTwoDaysAgo)).toBe("1d ago");
  });
});
