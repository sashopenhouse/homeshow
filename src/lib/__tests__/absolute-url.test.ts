import { describe, expect, it } from "vitest";
import { absoluteUrl } from "../utils";

describe("absoluteUrl", () => {
  it("prepends https:// to bare domains and paths", () => {
    expect(absoluteUrl("www.example.com")).toBe("https://www.example.com");
    expect(absoluteUrl("example.com/page")).toBe("https://example.com/page");
    expect(absoluteUrl("  example.com  ")).toBe("https://example.com");
    expect(absoluteUrl("/example.com")).toBe("https://example.com");
  });

  it("leaves absolute URLs and other schemes alone", () => {
    expect(absoluteUrl("https://www.cnyopenhouse.com/")).toBe("https://www.cnyopenhouse.com/");
    expect(absoluteUrl("http://old.example.com")).toBe("http://old.example.com");
    expect(absoluteUrl("HTTPS://Caps.example.com")).toBe("HTTPS://Caps.example.com");
    expect(absoluteUrl("mailto:hi@example.com")).toBe("mailto:hi@example.com");
  });

  it("returns null for blank input", () => {
    expect(absoluteUrl("")).toBeNull();
    expect(absoluteUrl("   ")).toBeNull();
    expect(absoluteUrl(null)).toBeNull();
    expect(absoluteUrl(undefined)).toBeNull();
  });
});
