import { describe, expect, it } from "vitest";

import { appendTag, parseTagsInput } from "@/lib/tags";

describe("parseTagsInput", () => {
  it("splits, trims, and drops empty entries", () => {
    expect(parseTagsInput(" react ,  next.js,, testing ")).toEqual([
      "react",
      "next.js",
      "testing",
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseTagsInput("")).toEqual([]);
  });
});

describe("appendTag", () => {
  it("appends a new tag to existing comma-separated tags", () => {
    expect(appendTag("react, testing", "typescript")).toBe("react, testing, typescript");
  });

  it("appends to an empty input", () => {
    expect(appendTag("", "typescript")).toBe("typescript");
  });

  it("is a no-op when the tag already exists case-insensitively", () => {
    expect(appendTag("React, testing", "react")).toBe("React, testing");
  });
});
