import { hostFromUrl } from "../url";

describe("hostFromUrl", () => {
  test("returns default host when url is undefined", () => {
    expect(hostFromUrl()).toBe("news.ycombinator.com");
  });

  test("returns default host when url is empty string", () => {
    expect(hostFromUrl("")).toBe("news.ycombinator.com");
  });

  test("extracts hostname from a valid URL", () => {
    expect(hostFromUrl("https://example.com")).toBe("example.com");
  });

  test("removes www prefix from hostname", () => {
    expect(hostFromUrl("https://www.example.com")).toBe("example.com");
  });

  test("handles URL with path, query, and hash", () => {
    expect(hostFromUrl("https://www.example.com/path?x=1#section")).toBe(
      "example.com",
    );
  });

  test("handles subdomains correctly", () => {
    expect(hostFromUrl("https://news.ycombinator.com/item?id=1")).toBe(
      "news.ycombinator.com",
    );
  });

  test("returns default host for invalid URL", () => {
    expect(hostFromUrl("not-a-valid-url")).toBe("news.ycombinator.com");
  });

  test("supports non-http schemes", () => {
    expect(hostFromUrl("ftp://ftp.example.com/file.txt")).toBe(
      "ftp.example.com",
    );
  });

  test("does not strip non-www prefixes", () => {
    expect(hostFromUrl("https://blog.example.com")).toBe("blog.example.com");
  });
});
