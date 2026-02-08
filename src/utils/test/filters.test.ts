import { withinRange } from "../filters";

describe("withinRange", () => {
  test("includes today for 1d", () => {
    const now = new Date();
    expect(withinRange(now, "1d")).toBe(true);
  });

  test("excludes 3 days ago for 1d", () => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    expect(withinRange(d, "1d")).toBe(false);
  });

  test("includes yesterday for 2d", () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(withinRange(d, "2d")).toBe(true);
  });
});
