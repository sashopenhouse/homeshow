"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Code,
  Eraser,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  Video,
} from "lucide-react";
import { normalizePostHtml, parseVideoUrl, sanitizeHtml, videoEmbedHtml } from "@/lib/post-html";
import { absoluteUrl } from "@/lib/utils";

// Dependency-free WYSIWYG editor for news posts. Visual mode is a
// contenteditable driven by document.execCommand (deprecated on paper,
// supported everywhere in practice); the HTML tab exposes the raw markup for
// anyone who wants to paste an embed or hand-tune. Output is sanitized again
// when rendered (see PostBody), so this only needs to be convenient, not
// bulletproof.

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const FONTS = [
  { label: "Default font", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

const SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "6" },
];

const BLOCKS = [
  { label: "Paragraph", value: "p" },
  { label: "Heading", value: "h2" },
  { label: "Subheading", value: "h3" },
  { label: "Quote", value: "blockquote" },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 320 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string | null>(null);
  const savedRange = useRef<Range | null>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");

  // Push external value changes (initial load, HTML tab edits) into the
  // contenteditable without clobbering the caret on our own keystrokes.
  useEffect(() => {
    if (mode !== "visual") return;
    const el = editorRef.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    el.innerHTML = normalizePostHtml(value);
    lastEmitted.current = value;
  }, [value, mode]);

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  };

  const rememberSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRange.current = range.cloneRange();
    }
  };

  const focusEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (command: string, arg?: string) => {
    focusEditor();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    emit();
  };

  const insertHtml = (html: string) => {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    emit();
  };

  const addLink = () => {
    rememberSelection();
    const sel = window.getSelection();
    const current = sel?.anchorNode?.parentElement?.closest("a")?.getAttribute("href") ?? "";
    const input = window.prompt("Link URL", current || "https://");
    if (input === null) return;
    const href = absoluteUrl(input);
    if (!href) {
      exec("unlink");
      return;
    }
    if (sel && sel.isCollapsed && !current) {
      insertHtml(`<a href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>`);
      return;
    }
    exec("createLink", href);
    // execCommand does not set target; patch the links we just created.
    editorRef.current?.querySelectorAll(`a[href="${href}"]`).forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    emit();
  };

  const addImage = () => {
    rememberSelection();
    const input = window.prompt("Image URL (paste a direct link to a .jpg, .png or .gif)");
    if (!input) return;
    const src = absoluteUrl(input);
    if (!src) return;
    const alt = window.prompt("Describe the image for screen readers (optional)") ?? "";
    insertHtml(`<figure><img src="${src}" alt="${alt.replace(/"/g, "&quot;")}"></figure><p><br></p>`);
  };

  const addVideo = () => {
    rememberSelection();
    const input = window.prompt("Video link (YouTube, Vimeo, or a direct .mp4 URL)");
    if (!input) return;
    const embed = parseVideoUrl(input);
    if (!embed) {
      window.alert("That link was not recognised. Paste a YouTube or Vimeo page link, or a direct .mp4 URL.");
      return;
    }
    insertHtml(`${videoEmbedHtml(embed)}<p><br></p>`);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    // Bare video links become embeds; everything else is cleaned of the
    // inline junk Word and Google Docs carry along.
    const embed = !html && text ? parseVideoUrl(text) : null;
    if (embed) {
      e.preventDefault();
      insertHtml(`${videoEmbedHtml(embed)}<p><br></p>`);
      return;
    }
    if (html) {
      e.preventDefault();
      insertHtml(sanitizeHtml(html));
    }
  };

  const switchMode = (next: "visual" | "html") => {
    if (next === mode) return;
    if (next === "html") emit();
    else lastEmitted.current = null; // force innerHTML refresh on return
    setMode(next);
  };

  const btn = "inline-flex items-center justify-center h-8 min-w-8 px-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-none disabled:opacity-40";
  const select = "h-8 px-1.5 text-xs bg-white border border-border text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="border border-border bg-background rounded-none">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border bg-muted/40">
        <select className={select} defaultValue="p" onChange={(e) => exec("formatBlock", e.target.value)} aria-label="Block style">
          {BLOCKS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
        <select
          className={select}
          defaultValue=""
          onChange={(e) => (e.target.value ? exec("fontName", e.target.value) : exec("removeFormat"))}
          aria-label="Font"
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select className={select} defaultValue="3" onChange={(e) => exec("fontSize", e.target.value)} aria-label="Font size">
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <label className={`${btn} cursor-pointer`} title="Text color">
          <span className="text-xs font-black">A</span>
          <input
            type="color"
            className="w-5 h-5 ml-0.5 border-0 bg-transparent cursor-pointer"
            onMouseDown={rememberSelection}
            onChange={(e) => exec("foreColor", e.target.value)}
            aria-label="Text color"
          />
        </label>

        <span className="w-px h-6 bg-border mx-0.5" />

        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} title="Bold"><Bold size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} title="Italic"><Italic size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")} title="Underline"><Underline size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("strikeThrough")} title="Strikethrough"><Strikethrough size={16} /></button>

        <span className="w-px h-6 bg-border mx-0.5" />

        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyLeft")} title="Align left"><AlignLeft size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("justifyCenter")} title="Center"><AlignCenter size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")} title="Bulleted list"><List size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered size={16} /></button>

        <span className="w-px h-6 bg-border mx-0.5" />

        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={addLink} title="Add link"><Link2 size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("unlink")} title="Remove link"><Unlink size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={addImage} title="Insert image"><ImageIcon size={16} /></button>
        <button type="button" className={`${btn} gap-1 text-xs font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={addVideo} title="Embed a YouTube, Vimeo or .mp4 video">
          <Video size={16} />
          Video
        </button>

        <span className="w-px h-6 bg-border mx-0.5" />

        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")} title="Clear formatting"><Eraser size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("undo")} title="Undo"><Undo2 size={16} /></button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("redo")} title="Redo"><Redo2 size={16} /></button>

        <div className="ml-auto flex items-center border border-border bg-white">
          <button
            type="button"
            onClick={() => switchMode("visual")}
            className={`h-7 px-2.5 text-xs font-bold ${mode === "visual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => switchMode("html")}
            className={`h-7 px-2.5 text-xs font-bold inline-flex items-center gap-1 ${mode === "html" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}
          >
            <Code size={14} />
            HTML
          </button>
        </div>
      </div>

      {/* Surface */}
      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={() => { rememberSelection(); emit(); }}
          onKeyUp={rememberSelection}
          onMouseUp={rememberSelection}
          onPaste={onPaste}
          className="post-body rte-surface p-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          style={{ minHeight }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => { lastEmitted.current = e.target.value; onChange(e.target.value); }}
          spellCheck={false}
          className="w-full p-4 text-xs font-mono text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
          style={{ minHeight }}
          placeholder="<p>Paste or write HTML here…</p>"
        />
      )}

      <div className="px-3 py-1.5 border-t border-border text-[11px] text-muted-foreground">
        Tip: paste a YouTube or Vimeo link straight into the editor to embed it. Use the HTML tab to paste an embed code or fine-tune the markup.
      </div>
    </div>
  );
}
