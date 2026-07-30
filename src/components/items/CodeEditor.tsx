"use client";

import { useState } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Copy, Crown, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { explainCode } from "@/actions/ai";
import { useEditorPreferences } from "@/components/settings/EditorPreferencesProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toMonacoLanguage } from "@/lib/monaco-language";
import { registerCustomMonacoThemes } from "@/lib/monaco-themes";

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 400;

interface CodeEditorExplain {
  title: string;
  isPro: boolean;
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  className?: string;
  explain?: CodeEditorExplain;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  className,
  explain,
}: CodeEditorProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [tab, setTab] = useState<"code" | "explain">("code");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const { preferences } = useEditorPreferences();

  const handleBeforeMount: BeforeMount = (monaco) => {
    registerCustomMonacoThemes(monaco);
  };

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

  async function handleExplain() {
    if (!explain || !value) return;

    setExplaining(true);
    const response = await explainCode({
      title: explain.title,
      content: value,
      language: language ?? "",
    });
    setExplaining(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setExplanation(response.data);
    setTab("explain");
  }

  const showingExplain = tab === "explain" && explanation;

  return (
    <div
      className={cn(
        "devstash-code-editor overflow-hidden rounded-lg border border-border/60",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-[#1e1e1e] px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {explanation && (
            <div className="flex items-center gap-1" role="tablist" aria-label="Code view">
              <CodeEditorTabButton active={tab === "code"} onClick={() => setTab("code")}>
                Code
              </CodeEditorTabButton>
              <CodeEditorTabButton active={tab === "explain"} onClick={() => setTab("explain")}>
                Explain
              </CodeEditorTabButton>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {language && !showingExplain && (
            <span className="font-mono text-xs text-zinc-400">{language}</span>
          )}
          {explain &&
            (explain.isPro ? (
              <button
                type="button"
                onClick={handleExplain}
                disabled={explaining || !value}
                className="text-zinc-400 transition-colors hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
                aria-label="Explain code"
              >
                {explaining ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="size-3.5" aria-hidden="true" />
                )}
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-disabled="true"
                      className="cursor-not-allowed text-zinc-400 opacity-40"
                      aria-label="Explain code (Pro feature)"
                      onClick={(event) => event.preventDefault()}
                    />
                  }
                >
                  <Crown className="size-3.5" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>AI features require Pro subscription</TooltipContent>
              </Tooltip>
            ))}
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
      {showingExplain ? (
        <div
          className="devstash-scroll markdown-preview overflow-y-auto bg-[#1e1e1e] px-4 py-3"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
        </div>
      ) : (
        <div style={{ height }}>
          <Editor
            height="100%"
            language={toMonacoLanguage(language)}
            value={value}
            theme={preferences.theme}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            onChange={readOnly ? undefined : (next) => onChange?.(next ?? "")}
            options={{
              readOnly,
              domReadOnly: readOnly,
              minimap: { enabled: preferences.minimap },
              fontSize: preferences.fontSize,
              tabSize: preferences.tabSize,
              wordWrap: preferences.wordWrap ? "on" : "off",
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
      )}
    </div>
  );
}

function CodeEditorTabButton({
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
