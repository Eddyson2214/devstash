import { describe, expect, it } from "vitest";

import { getFileIconCategory } from "@/lib/file-icon";

describe("getFileIconCategory", () => {
  it("returns generic when there is no file name", () => {
    expect(getFileIconCategory(null)).toBe("generic");
  });

  it("returns spreadsheet for .csv", () => {
    expect(getFileIconCategory("data.csv")).toBe("spreadsheet");
  });

  it("returns code for structured/config extensions", () => {
    expect(getFileIconCategory("config.json")).toBe("code");
    expect(getFileIconCategory("config.yaml")).toBe("code");
    expect(getFileIconCategory("config.yml")).toBe("code");
    expect(getFileIconCategory("data.xml")).toBe("code");
    expect(getFileIconCategory("settings.toml")).toBe("code");
    expect(getFileIconCategory("settings.ini")).toBe("code");
  });

  it("returns text for document extensions", () => {
    expect(getFileIconCategory("report.pdf")).toBe("text");
    expect(getFileIconCategory("notes.txt")).toBe("text");
    expect(getFileIconCategory("readme.md")).toBe("text");
  });

  it("is case-insensitive on the extension", () => {
    expect(getFileIconCategory("REPORT.PDF")).toBe("text");
  });

  it("falls back to generic for an unrecognized extension", () => {
    expect(getFileIconCategory("archive.zip")).toBe("generic");
  });
});
