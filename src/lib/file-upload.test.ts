import { describe, expect, it } from "vitest";

import { FILE_MAX_SIZE, IMAGE_MAX_SIZE, formatFileSize, validateUpload } from "@/lib/file-upload";

describe("validateUpload", () => {
  it("accepts a valid image within the size limit", () => {
    expect(
      validateUpload("image", { fileName: "photo.png", fileSize: 1024, mimeType: "image/png" })
    ).toBeNull();
  });

  it("accepts a valid file within the size limit", () => {
    expect(
      validateUpload("file", {
        fileName: "notes.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      })
    ).toBeNull();
  });

  it("rejects an unsupported extension", () => {
    expect(
      validateUpload("image", { fileName: "malware.exe", fileSize: 1024, mimeType: "" })
    ).toMatch(/Unsupported file extension/);
  });

  it("rejects a mismatched MIME type for a recognized extension", () => {
    expect(
      validateUpload("image", {
        fileName: "photo.png",
        fileSize: 1024,
        mimeType: "application/pdf",
      })
    ).toBe("Unsupported file type");
  });

  it("accepts an empty MIME type as a generic fallback for less common extensions", () => {
    expect(
      validateUpload("file", { fileName: "config.toml", fileSize: 1024, mimeType: "" })
    ).toBeNull();
  });

  it("rejects an image over the 5MB limit", () => {
    expect(
      validateUpload("image", {
        fileName: "huge.png",
        fileSize: IMAGE_MAX_SIZE + 1,
        mimeType: "image/png",
      })
    ).toMatch(/5MB limit/);
  });

  it("rejects a file over the 10MB limit", () => {
    expect(
      validateUpload("file", {
        fileName: "huge.pdf",
        fileSize: FILE_MAX_SIZE + 1,
        mimeType: "application/pdf",
      })
    ).toMatch(/10MB limit/);
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
