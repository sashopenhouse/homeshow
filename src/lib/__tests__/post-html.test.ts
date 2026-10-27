import { describe, expect, it } from "vitest";
import {
  excerptFromHtml,
  isHtml,
  normalizePostHtml,
  parseVideoUrl,
  plainTextToHtml,
  stripHtml,
  videoEmbedHtml,
} from "@/lib/post-html";

describe("plain text / html normalisation", () => {
  it("detects html", () => {
    expect(isHtml("<p>hi</p>")).toBe(true);
    expect(isHtml("plain text with 2 < 3")).toBe(false);
  });

  it("converts legacy plain text paragraphs", () => {
    expect(plainTextToHtml("One\n\nTwo\nthree")).toBe("<p>One</p><p>Two<br>three</p>");
    expect(plainTextToHtml("a & <b>")).toBe("<p>a &amp; &lt;b&gt;</p>");
  });

  it("leaves html alone and wraps text", () => {
    expect(normalizePostHtml("<h2>x</h2>")).toBe("<h2>x</h2>");
    expect(normalizePostHtml("just text")).toBe("<p>just text</p>");
    expect(normalizePostHtml("")).toBe("");
    expect(normalizePostHtml(null)).toBe("");
  });

  it("strips html for excerpts", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p><p>Bye &amp; co</p>")).toBe("Hello world\nBye & co");
    expect(excerptFromHtml("<p>" + "word ".repeat(50) + "</p>", 30)).toMatch(/^word( word)*\.\.\.$/);
    expect(excerptFromHtml("<p>short</p>")).toBe("short");
  });
});

describe("parseVideoUrl", () => {
  it("handles the youtube url shapes people paste", () => {
    const expected = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
    expect(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.src).toBe(expected);
    expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ?si=abc")?.src).toBe(expected);
    expect(parseVideoUrl("https://youtube.com/shorts/dQw4w9WgXcQ")?.src).toBe(expected);
    expect(parseVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")?.src).toBe(expected);
    expect(parseVideoUrl("youtube.com/watch?v=dQw4w9WgXcQ&t=90s")?.src).toBe(expected + "?start=90");
  });

  it("handles vimeo", () => {
    expect(parseVideoUrl("https://vimeo.com/123456")).toEqual({ kind: "vimeo", src: "https://player.vimeo.com/video/123456" });
    expect(parseVideoUrl("https://vimeo.com/123456/abcdef12")?.src).toBe("https://player.vimeo.com/video/123456?h=abcdef12");
    expect(parseVideoUrl("https://player.vimeo.com/video/123456")?.src).toBe("https://player.vimeo.com/video/123456");
  });

  it("handles direct files and rejects everything else", () => {
    expect(parseVideoUrl("https://cdn.example.com/clip.mp4")).toEqual({ kind: "file", src: "https://cdn.example.com/clip.mp4" });
    expect(parseVideoUrl("https://example.com/page")).toBeNull();
    expect(parseVideoUrl("not a url at all")).toBeNull();
    expect(parseVideoUrl("")).toBeNull();
  });

  it("renders embed markup", () => {
    const yt = videoEmbedHtml({ kind: "youtube", src: "https://www.youtube-nocookie.com/embed/x" });
    expect(yt).toContain('<iframe src="https://www.youtube-nocookie.com/embed/x"');
    expect(yt).toContain("allowfullscreen");
    const file = videoEmbedHtml({ kind: "file", src: "https://a.b/c.mp4" });
    expect(file).toContain("<video controls");
  });
});
