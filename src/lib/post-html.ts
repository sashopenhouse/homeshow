// Helpers for news post bodies. Posts written before the rich-text editor are
// plain text with blank-line paragraphs; newer posts are HTML produced by
// src/components/RichTextEditor.tsx (or typed by hand in its HTML tab). Both
// end up rendered through sanitizeHtml() on the public page.

const HTML_TAG = /<\/?[a-z][\s\S]*?>/i;

export function isHtml(value: string): boolean {
  return HTML_TAG.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "Para one\n\nPara two\nline" -> "<p>Para one</p><p>Para two<br>line</p>"
export function plainTextToHtml(value: string): string {
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Whatever is stored, return HTML the editor and renderer can use.
export function normalizePostHtml(value: string | null | undefined): string {
  const text = value ?? "";
  if (!text.trim()) return "";
  return isHtml(text) ? text : plainTextToHtml(text);
}

// Used for auto-generated excerpts and share text.
export function stripHtml(value: string): string {
  return value
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|figcaption)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function excerptFromHtml(value: string, max = 120): string {
  const text = stripHtml(value).replace(/\n+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "...";
}

// --- Video embeds -----------------------------------------------------------

export interface VideoEmbed {
  kind: "youtube" | "vimeo" | "file";
  src: string;
}

// Accepts the URLs people actually paste (watch, share, shorts, embed, vimeo
// pages, direct .mp4 links) and returns something embeddable, or null.
export function parseVideoUrl(input: string): VideoEmbed | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? { kind: "youtube", src: youtubeEmbed(id, url) } : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    let id = url.searchParams.get("v");
    if (!id && (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live" || parts[0] === "v")) {
      id = parts[1] ?? null;
    }
    return id ? { kind: "youtube", src: youtubeEmbed(id, url) } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts.find((p) => /^\d+$/.test(p));
    if (!id) return null;
    const hash = parts[parts.indexOf(id) + 1];
    const extra = hash && /^[a-z0-9]+$/i.test(hash) ? `?h=${hash}` : "";
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${id}${extra}` };
  }
  if (/\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(url.pathname + url.search)) {
    return { kind: "file", src: url.toString() };
  }
  return null;
}

function youtubeEmbed(id: string, url: URL): string {
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, "");
  const start = url.searchParams.get("t") ?? url.searchParams.get("start");
  const seconds = start ? parseInt(start.replace(/[^0-9]/g, ""), 10) : NaN;
  const query = Number.isFinite(seconds) && seconds > 0 ? `?start=${seconds}` : "";
  return `https://www.youtube-nocookie.com/embed/${safeId}${query}`;
}

export function videoEmbedHtml(embed: VideoEmbed): string {
  if (embed.kind === "file") {
    return `<figure class="post-video"><video controls playsinline preload="metadata" src="${escapeHtml(embed.src)}"></video></figure>`;
  }
  return `<figure class="post-video"><iframe src="${escapeHtml(embed.src)}" title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></figure>`;
}

// --- Sanitizer (browser only; uses DOMParser) -------------------------------

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "div", "span", "figure", "figcaption",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "small", "font",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "video", "source", "iframe",
  "table", "thead", "tbody", "tr", "th", "td",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  "*": new Set(["style", "class", "title"]),
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height"]),
  video: new Set(["src", "controls", "playsinline", "preload", "poster", "width", "height", "muted", "loop"]),
  source: new Set(["src", "type"]),
  iframe: new Set(["src", "allow", "allowfullscreen", "loading", "referrerpolicy", "width", "height"]),
  font: new Set(["face", "size", "color"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
};

const ALLOWED_STYLE = new Set([
  "font-family", "font-size", "font-weight", "font-style", "color", "background-color",
  "text-align", "text-decoration", "line-height",
]);

const IFRAME_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

function safeUrl(value: string, allowData = false): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (/^[/#]/.test(v) || !/^[a-z][a-z0-9+.-]*:/i.test(v)) return v; // relative
  if (allowData && /^data:image\//i.test(v)) return v;
  return null;
}

function safeIframeSrc(value: string): string | null {
  try {
    const url = new URL(value, "https://example.invalid");
    if (url.protocol !== "https:") return null;
    if (!IFRAME_HOSTS.includes(url.hostname)) return null;
    if (url.hostname.includes("youtube") && !url.pathname.startsWith("/embed/")) return null;
    if (url.hostname === "player.vimeo.com" && !url.pathname.startsWith("/video/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sanitizeStyle(value: string): string {
  const kept: string[] = [];
  for (const decl of value.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();
    if (!ALLOWED_STYLE.has(prop)) continue;
    if (/url\(|expression\(|javascript:/i.test(val)) continue;
    kept.push(`${prop}: ${val}`);
  }
  return kept.join("; ");
}

function sanitizeNode(node: Element) {
  for (const child of Array.from(node.children)) {
    const tag = child.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      if (tag === "script" || tag === "style" || tag === "object" || tag === "embed") {
        child.remove();
      } else {
        // Unknown wrapper: keep its text/children, drop the element itself.
        sanitizeNode(child);
        child.replaceWith(...Array.from(child.childNodes));
      }
      continue;
    }
    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase();
      const allowed = ALLOWED_ATTRS["*"].has(name) || ALLOWED_ATTRS[tag]?.has(name);
      if (!allowed || name.startsWith("on")) {
        child.removeAttribute(attr.name);
        continue;
      }
      if (name === "style") {
        const cleaned = sanitizeStyle(attr.value);
        if (cleaned) child.setAttribute("style", cleaned);
        else child.removeAttribute("style");
      } else if (name === "href") {
        const url = safeUrl(attr.value);
        if (url) child.setAttribute("href", url);
        else child.removeAttribute("href");
      } else if (name === "src" && tag === "iframe") {
        const url = safeIframeSrc(attr.value);
        if (url) child.setAttribute("src", url);
        else child.remove();
      } else if (name === "src" || name === "poster") {
        const url = safeUrl(attr.value, tag === "img");
        if (url) child.setAttribute(name, url);
        else child.removeAttribute(name);
      }
    }
    if (tag === "iframe" && !child.getAttribute("src")) {
      child.remove();
      continue;
    }
    if (tag === "a" && child.getAttribute("target") === "_blank") {
      child.setAttribute("rel", "noopener noreferrer");
    }
    sanitizeNode(child);
  }
}

// Returns HTML safe to inject with dangerouslySetInnerHTML. On the server
// (no DOMParser) returns "" so the client fills it in after hydration.
export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}
