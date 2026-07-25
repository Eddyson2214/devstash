import { File, FileCode, FileSpreadsheet, FileText, type LucideIcon } from "lucide-react";

const CODE_EXTENSIONS = new Set([".json", ".yaml", ".yml", ".xml", ".toml", ".ini"]);
const TEXT_EXTENSIONS = new Set([".pdf", ".txt", ".md"]);

export type FileIconCategory = "code" | "text" | "spreadsheet" | "generic";

export const FILE_ICON_BY_CATEGORY: Record<FileIconCategory, LucideIcon> = {
  code: FileCode,
  text: FileText,
  spreadsheet: FileSpreadsheet,
  generic: File,
};

function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index).toLowerCase();
}

export function getFileIconCategory(fileName: string | null): FileIconCategory {
  if (!fileName) return "generic";

  const extension = getExtension(fileName);
  if (extension === ".csv") return "spreadsheet";
  if (CODE_EXTENSIONS.has(extension)) return "code";
  if (TEXT_EXTENSIONS.has(extension)) return "text";

  return "generic";
}
