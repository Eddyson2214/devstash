"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { generateAiSummary } from "@/actions/ai";
import { Button } from "@/components/ui/button";

interface SuggestDescriptionButtonProps {
  title: string;
  content: string;
  url?: string;
  fileName?: string;
  onSuggest: (description: string) => void;
}

export function SuggestDescriptionButton({
  title,
  content,
  url = "",
  fileName = "",
  onSuggest,
}: SuggestDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    const response = await generateAiSummary({ title, content, url, fileName });
    setLoading(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    onSuggest(response.data);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-fit"
      disabled={loading || !title.trim()}
      onClick={handleSuggest}
    >
      <Sparkles className="size-4" aria-hidden="true" />
      {loading ? "Summarizing..." : "Suggest Description"}
    </Button>
  );
}
