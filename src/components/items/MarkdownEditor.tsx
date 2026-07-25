"use client";

import { useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 400;

type MarkdownTab = "write" | "preview";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<MarkdownTab>(readOnly ? "preview" : "write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || tab !== "write") return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      MAX_HEIGHT,
      Math.max(MIN_HEIGHT, textarea.scrollHeight)
    )}px`;
  }, [value, tab]);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  const showWrite = !readOnly && tab === "write";

  return (
    <div
      className={cn(
        "devstash-code-editor overflow-hidden rounded-lg border border-border/60",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-[#2d2d2d] px-3 py-2">
        {readOnly ? (
          <span className="text-xs font-medium text-zinc-400">Preview</span>
        ) : (
          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label="Markdown editor mode"
          >
            <MarkdownTabButton active={tab === "write"} onClick={() => setTab("write")}>
              Write
            </MarkdownTabButton>
            <MarkdownTabButton active={tab === "preview"} onClick={() => setTab("preview")}>
              Preview
            </MarkdownTabButton>
          </div>
        )}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Copy content"
        >
          <Copy className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      {showWrite ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="Write markdown..."
          className="devstash-scroll block w-full resize-none bg-[#1e1e1e] px-4 py-3 font-mono text-sm text-zinc-100 outline-none"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        />
      ) : (
        <div
          className="devstash-scroll markdown-preview overflow-y-auto bg-[#1e1e1e] px-4 py-3"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || "*Nothing to preview*"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function MarkdownTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
        active ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
      )}
    >
      {children}
    </button>
  );
}
