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

export interface LanguageSelectOption {
  value: string;
  label: string;
}

export const LANGUAGE_SELECT_OPTIONS: LanguageSelectOption[] = [
  { value: "", label: "Plain Text" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Python", label: "Python" },
  { value: "Ruby", label: "Ruby" },
  { value: "Go", label: "Go" },
  { value: "Rust", label: "Rust" },
  { value: "Java", label: "Java" },
  { value: "C", label: "C" },
  { value: "C++", label: "C++" },
  { value: "C#", label: "C#" },
  { value: "PHP", label: "PHP" },
  { value: "HTML", label: "HTML" },
  { value: "CSS", label: "CSS" },
  { value: "SCSS", label: "SCSS" },
  { value: "Less", label: "Less" },
  { value: "JSON", label: "JSON" },
  { value: "YAML", label: "YAML" },
  { value: "XML", label: "XML" },
  { value: "SQL", label: "SQL" },
  { value: "Bash", label: "Bash" },
  { value: "PowerShell", label: "PowerShell" },
  { value: "Kotlin", label: "Kotlin" },
  { value: "Swift", label: "Swift" },
  { value: "Dart", label: "Dart" },
  { value: "GraphQL", label: "GraphQL" },
  { value: "Markdown", label: "Markdown" },
  { value: "Dockerfile", label: "Dockerfile" },
];

export function toMonacoLanguage(language?: string | null): string {
  if (!language) return "plaintext";

  const normalized = language.trim().toLowerCase();
  const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;

  return MONACO_LANGUAGES.has(resolved) ? resolved : "plaintext";
}
