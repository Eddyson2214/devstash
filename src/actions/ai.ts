"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { AI_MODEL, openai } from "@/lib/openai";
import {
  aiSuggestSummaryRatelimit,
  aiSuggestTagsRatelimit,
  checkRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

const MAX_CONTENT_LENGTH = 2000;
const MAX_TAG_SUGGESTIONS = 5;

const SYSTEM_INSTRUCTIONS =
  'You are a tagging assistant for DevStash, a developer knowledge-management tool. Given an item\'s title and content, suggest 3 to 5 short, lowercase, freeform tags that would help the user find this item again later. Respond with ONLY a JSON object in the exact shape {"tags": ["tag1", "tag2"]} and nothing else.';

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().nullable().optional().default(""),
});

export type GenerateAutoTagsInput = z.infer<typeof generateAutoTagsSchema>;

function parseTagSuggestions(raw: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { tags?: unknown }).tags)
      ? (parsed as { tags: unknown[] }).tags
      : [];

  const tags = list
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(tags)).slice(0, MAX_TAG_SUGGESTIONS);
}

export async function generateAutoTags(
  input: GenerateAutoTagsInput
): Promise<{ success: true; data: string[] } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "AI tag suggestions are a Pro feature." };
  }

  const { success: withinLimit } = await checkRateLimit(aiSuggestTagsRatelimit, session.user.id);
  if (!withinLimit) {
    return { success: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = generateAutoTagsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const truncatedContent = (parsed.data.content ?? "").slice(0, MAX_CONTENT_LENGTH);

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions: SYSTEM_INSTRUCTIONS,
      input: `Respond in JSON.\n\nTitle: ${parsed.data.title}\n\nContent:\n${truncatedContent || "(no content)"}`,
      text: {
        format: { type: "json_object" },
      },
    });

    const tags = parseTagSuggestions(response.output_text);
    if (tags.length === 0) {
      return { success: false, error: "Couldn't generate tag suggestions. Please try again." };
    }

    return { success: true, data: tags };
  } catch (error) {
    console.error("generateAutoTags failed:", error);
    return { success: false, error: "Couldn't generate tag suggestions. Please try again." };
  }
}

const SUMMARY_SYSTEM_INSTRUCTIONS =
  'You are a summarization assistant for DevStash, a developer knowledge-management tool. Given an item\'s title and whatever content is available (code, a prompt, a note, a URL, or a file name), write a concise 1-2 sentence summary suitable for the item\'s description field. Respond with ONLY a JSON object in the exact shape {"summary": "..."} and nothing else.';

const generateAiSummarySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().nullable().optional().default(""),
  url: z.string().trim().nullable().optional().default(""),
  fileName: z.string().trim().nullable().optional().default(""),
});

export type GenerateAiSummaryInput = z.infer<typeof generateAiSummarySchema>;

function parseSummary(raw: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const summary =
    parsed && typeof parsed === "object" && typeof (parsed as { summary?: unknown }).summary === "string"
      ? (parsed as { summary: string }).summary
      : null;

  const trimmed = summary?.trim();
  return trimmed ? trimmed : null;
}

export async function generateAiSummary(
  input: GenerateAiSummaryInput
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "AI summaries are a Pro feature." };
  }

  const { success: withinLimit } = await checkRateLimit(aiSuggestSummaryRatelimit, session.user.id);
  if (!withinLimit) {
    return { success: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = generateAiSummarySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const truncatedContent = (parsed.data.content ?? "").slice(0, MAX_CONTENT_LENGTH);
  const details = [
    truncatedContent && `Content:\n${truncatedContent}`,
    parsed.data.url && `URL: ${parsed.data.url}`,
    parsed.data.fileName && `File name: ${parsed.data.fileName}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions: SUMMARY_SYSTEM_INSTRUCTIONS,
      input: `Respond in JSON.\n\nTitle: ${parsed.data.title}\n\n${details || "(no additional content)"}`,
      text: {
        format: { type: "json_object" },
      },
    });

    const summary = parseSummary(response.output_text);
    if (!summary) {
      return { success: false, error: "Couldn't generate a summary. Please try again." };
    }

    return { success: true, data: summary };
  } catch (error) {
    console.error("generateAiSummary failed:", error);
    return { success: false, error: "Couldn't generate a summary. Please try again." };
  }
}
