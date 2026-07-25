const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  golang: "go",
  rs: "rust",
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  ps1: "powershell",
  yml: "yaml",
  md: "markdown",
  dockerfile: "dockerfile",
  "objective-c": "objective-c",
};

const MONACO_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "python",
  "ruby",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "html",
  "css",
  "scss",
  "less",
  "json",
  "yaml",
  "xml",
  "sql",
  "shell",
  "powershell",
  "kotlin",
  "swift",
  "dart",
  "graphql",
  "markdown",
  "dockerfile",
  "objective-c",
  "plaintext",
]);

export function toMonacoLanguage(language?: string | null): string {
  if (!language) return "plaintext";

  const normalized = language.trim().toLowerCase();
  const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;

  return MONACO_LANGUAGES.has(resolved) ? resolved : "plaintext";
}
