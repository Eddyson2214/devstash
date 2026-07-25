export type UploadCategory = "file" | "image";

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const FILE_MAX_SIZE = 10 * 1024 * 1024;

export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
export const FILE_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".csv",
  ".toml",
  ".ini",
];

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
export const FILE_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
];

// Browsers/OSes often report an empty or generic MIME type for less common
// extensions (.yaml, .toml, .ini, ...), so the MIME check is a sanity check
// on top of the authoritative extension allowlist, not the primary gate.
const GENERIC_MIME_TYPES = new Set(["", "application/octet-stream"]);

export interface UploadValidationInput {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index).toLowerCase();
}

export function validateUpload(
  category: UploadCategory,
  input: UploadValidationInput
): string | null {
  const maxSize = category === "image" ? IMAGE_MAX_SIZE : FILE_MAX_SIZE;
  const extensions = category === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const mimeTypes = category === "image" ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;

  const extension = getExtension(input.fileName);
  if (!extensions.includes(extension)) {
    return `Unsupported file extension. Allowed: ${extensions.join(", ")}`;
  }

  if (!GENERIC_MIME_TYPES.has(input.mimeType) && !mimeTypes.includes(input.mimeType)) {
    return "Unsupported file type";
  }

  if (input.fileSize > maxSize) {
    return `File exceeds the ${Math.round(maxSize / (1024 * 1024))}MB limit`;
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
