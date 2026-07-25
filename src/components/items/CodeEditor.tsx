"use client";

import { useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { toMonacoLanguage } from "@/lib/monaco-language";

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 400;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);

  const handleMount: OnMount = (editor) => {
    const applyHeight = () => {
      const contentHeight = editor.getContentHeight();
      setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, contentHeight)));
    };

    applyHeight();
    editor.onDidContentSizeChange(applyHeight);
  };

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  return (
    <div
      className={cn(
        "devstash-code-editor overflow-hidden rounded-lg border border-border/60",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-[#1e1e1e] px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f56]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="font-mono text-xs text-zinc-400">{language}</span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Copy code"
          >
            <Copy className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div style={{ height }}>
        <Editor
          height="100%"
          language={toMonacoLanguage(language)}
          value={value}
          theme="vs-dark"
          onMount={handleMount}
          onChange={readOnly ? undefined : (next) => onChange?.(next ?? "")}
          options={{
            readOnly,
            domReadOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            renderLineHighlight: readOnly ? "none" : "line",
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </div>
    </div>
  );
}
