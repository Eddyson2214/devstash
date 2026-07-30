import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({
  openai: {
    responses: { create: vi.fn() },
  },
  AI_MODEL: "gpt-5-nano",
}));

vi.mock("@/lib/rate-limit", () => ({
  aiSuggestTagsRatelimit: {},
  aiSuggestSummaryRatelimit: {},
  aiExplainCodeRatelimit: {},
  aiOptimizePromptRatelimit: {},
  checkRateLimit: vi.fn(),
  RATE_LIMIT_MESSAGE: "Too many attempts. Please try again later.",
}));

import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";
import { explainCode, generateAiSummary, generateAutoTags, optimizePrompt } from "@/actions/ai";

const mockedAuth = vi.mocked(auth);
const mockedResponsesCreate = vi.mocked(openai.responses.create);
const mockedCheckRateLimit = vi.mocked(checkRateLimit);

beforeEach(() => {
  vi.clearAllMocks();
  mockedCheckRateLimit.mockResolvedValue({ success: true, reset: 0 });
});

describe("generateAutoTags", () => {
  it("rejects when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await generateAutoTags({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects free users", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } });

    const result = await generateAutoTags({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "AI tag suggestions are a Pro feature." });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedCheckRateLimit.mockResolvedValue({ success: false, reset: Date.now() });

    const result = await generateAutoTags({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Too many attempts. Please try again later.",
    });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });

    const result = await generateAutoTags({ title: "  ", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("parses a {tags: [...]} response and lowercases/dedupes tags", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ["React", "react", "Hooks"] }),
    });

    const result = await generateAutoTags({ title: "My Hook", content: "useEffect(...)" });

    expect(result).toEqual({ success: true, data: ["react", "hooks"] });
  });

  it("parses a bare array response", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify(["docker", "compose"]),
    });

    const result = await generateAutoTags({ title: "My Dockerfile", content: "FROM node" });

    expect(result).toEqual({ success: true, data: ["docker", "compose"] });
  });

  it("truncates content to 2000 chars before calling the API", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({ output_text: JSON.stringify({ tags: ["long"] }) });

    const longContent = "a".repeat(3000);
    await generateAutoTags({ title: "Big file", content: longContent });

    const call = mockedResponsesCreate.mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a friendly error when parsing fails or yields no tags", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({ output_text: "not json" });

    const result = await generateAutoTags({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate tag suggestions. Please try again.",
    });
  });

  it("returns a friendly error when the API call throws", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedResponsesCreate.mockRejectedValue(new Error("OpenAI is down"));

    const result = await generateAutoTags({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate tag suggestions. Please try again.",
    });
  });
});

describe("generateAiSummary", () => {
  it("rejects when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await generateAiSummary({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects free users", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } });

    const result = await generateAiSummary({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "AI summaries are a Pro feature." });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedCheckRateLimit.mockResolvedValue({ success: false, reset: Date.now() });

    const result = await generateAiSummary({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Too many attempts. Please try again later.",
    });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });

    const result = await generateAiSummary({ title: "  ", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("parses a {summary: ...} response", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ summary: "A debounce hook for React inputs." }),
    });

    const result = await generateAiSummary({ title: "Debounce Hook", content: "useEffect(...)" });

    expect(result).toEqual({ success: true, data: "A debounce hook for React inputs." });
  });

  it("falls back to url and fileName when content is empty", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ summary: "A link to the Next.js docs." }),
    });

    await generateAiSummary({
      title: "Next.js Docs",
      content: "",
      url: "https://nextjs.org/docs",
      fileName: "",
    });

    const call = mockedResponsesCreate.mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("https://nextjs.org/docs");
  });

  it("truncates content to 2000 chars before calling the API", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({ output_text: JSON.stringify({ summary: "long" }) });

    const longContent = "a".repeat(3000);
    await generateAiSummary({ title: "Big file", content: longContent });

    const call = mockedResponsesCreate.mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a friendly error when parsing fails or yields no summary", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({ output_text: "not json" });

    const result = await generateAiSummary({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate a summary. Please try again.",
    });
  });

  it("returns a friendly error when the API call throws", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedResponsesCreate.mockRejectedValue(new Error("OpenAI is down"));

    const result = await generateAiSummary({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate a summary. Please try again.",
    });
  });
});

describe("explainCode", () => {
  it("rejects when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await explainCode({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects free users", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } });

    const result = await explainCode({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "AI code explanations are a Pro feature." });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedCheckRateLimit.mockResolvedValue({ success: false, reset: Date.now() });

    const result = await explainCode({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Too many attempts. Please try again later.",
    });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });

    const result = await explainCode({ title: "  ", content: "console.log(1)" });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects empty content", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });

    const result = await explainCode({ title: "My Snippet", content: "   " });

    expect(result).toEqual({ success: false, error: "Content is required" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("parses a {explanation: ...} response", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ explanation: "This debounces a React input handler." }),
    });

    const result = await explainCode({
      title: "Debounce Hook",
      content: "useEffect(...)",
      language: "typescript",
    });

    expect(result).toEqual({ success: true, data: "This debounces a React input handler." });
  });

  it("includes the language in the prompt when provided", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ explanation: "..." }),
    });

    await explainCode({ title: "My Script", content: "echo hi", language: "bash" });

    const call = mockedResponsesCreate.mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("Language: bash");
  });

  it("truncates content to 2000 chars before calling the API", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ explanation: "long" }),
    });

    const longContent = "a".repeat(3000);
    await explainCode({ title: "Big file", content: longContent });

    const call = mockedResponsesCreate.mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a friendly error when parsing fails or yields no explanation", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({ output_text: "not json" });

    const result = await explainCode({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate an explanation. Please try again.",
    });
  });

  it("returns a friendly error when the API call throws", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedResponsesCreate.mockRejectedValue(new Error("OpenAI is down"));

    const result = await explainCode({ title: "My Snippet", content: "console.log(1)" });

    expect(result).toEqual({
      success: false,
      error: "Couldn't generate an explanation. Please try again.",
    });
  });
});

describe("optimizePrompt", () => {
  it("rejects when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await optimizePrompt({ title: "My Prompt", content: "Write a poem." });

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects free users", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } });

    const result = await optimizePrompt({ title: "My Prompt", content: "Write a poem." });

    expect(result).toEqual({
      success: false,
      error: "AI prompt optimization is a Pro feature.",
    });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedCheckRateLimit.mockResolvedValue({ success: false, reset: Date.now() });

    const result = await optimizePrompt({ title: "My Prompt", content: "Write a poem." });

    expect(result).toEqual({
      success: false,
      error: "Too many attempts. Please try again later.",
    });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });

    const result = await optimizePrompt({ title: "  ", content: "Write a poem." });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("rejects empty content", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });

    const result = await optimizePrompt({ title: "My Prompt", content: "   " });

    expect(result).toEqual({ success: false, error: "Content is required" });
    expect(mockedResponsesCreate).not.toHaveBeenCalled();
  });

  it("parses a {optimizedPrompt: ...} response", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ optimizedPrompt: "Write a haiku about autumn leaves." }),
    });

    const result = await optimizePrompt({ title: "Poem Prompt", content: "write a poem" });

    expect(result).toEqual({ success: true, data: "Write a haiku about autumn leaves." });
  });

  it("truncates content to 2000 chars before calling the API", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ optimizedPrompt: "long" }),
    });

    const longContent = "a".repeat(3000);
    await optimizePrompt({ title: "Big prompt", content: longContent });

    const call = mockedResponsesCreate.mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a friendly error when parsing fails or yields no optimized prompt", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedResponsesCreate.mockResolvedValue({ output_text: "not json" });

    const result = await optimizePrompt({ title: "My Prompt", content: "Write a poem." });

    expect(result).toEqual({
      success: false,
      error: "Couldn't optimize this prompt. Please try again.",
    });
  });

  it("returns a friendly error when the API call throws", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } });
    mockedResponsesCreate.mockRejectedValue(new Error("OpenAI is down"));

    const result = await optimizePrompt({ title: "My Prompt", content: "Write a poem." });

    expect(result).toEqual({
      success: false,
      error: "Couldn't optimize this prompt. Please try again.",
    });
  });
});
