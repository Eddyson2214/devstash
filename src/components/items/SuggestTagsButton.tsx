"use client";

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { generateAutoTags } from "@/actions/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseTagsInput } from "@/lib/tags";

interface SuggestTagsButtonProps {
  title: string;
  content: string;
  tagsInput: string;
  onAcceptTag: (tag: string) => void;
}

export function SuggestTagsButton({
  title,
  content,
  tagsInput,
  onAcceptTag,
}: SuggestTagsButtonProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    const response = await generateAutoTags({ title, content });
    setLoading(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    const existing = new Set(parseTagsInput(tagsInput).map((tag) => tag.toLowerCase()));
    setSuggestions(response.data.filter((tag) => !existing.has(tag)));
  }

  function accept(tag: string) {
    onAcceptTag(tag);
    setSuggestions((prev) => prev.filter((suggestion) => suggestion !== tag));
  }

  function reject(tag: string) {
    setSuggestions((prev) => prev.filter((suggestion) => suggestion !== tag));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit"
        disabled={loading || !title.trim()}
        onClick={handleSuggest}
      >
        <Sparkles className="size-4" aria-hidden="true" />
        {loading ? "Suggesting..." : "Suggest Tags"}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => accept(tag)}
                aria-label={`Accept tag ${tag}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <Check className="size-3" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => reject(tag)}
                aria-label={`Reject tag ${tag}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
