export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemTypeIds: string[];
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  itemTypeId: string;
  collectionIds: string[];
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
}

export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
};

export const itemTypes: ItemType[] = [
  { id: "type-snippet", name: "Snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { id: "type-prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { id: "type-command", name: "Command", icon: "Terminal", color: "#f97316", isSystem: true },
  { id: "type-note", name: "Note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "type-file", name: "File", icon: "File", color: "#6b7280", isSystem: true },
  { id: "type-image", name: "Image", icon: "Image", color: "#ec4899", isSystem: true },
  { id: "type-link", name: "Link", icon: "Link", color: "#10b981", isSystem: true },
];

export const collections: Collection[] = [
  {
    id: "collection-react-patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemTypeIds: ["type-snippet", "type-note", "type-link"],
    createdAt: "2026-01-10",
  },
  {
    id: "collection-python-snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemTypeIds: ["type-snippet", "type-note"],
    createdAt: "2025-11-02",
  },
  {
    id: "collection-context-files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemTypeIds: ["type-file", "type-note"],
    createdAt: "2026-02-20",
  },
  {
    id: "collection-interview-prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemTypeIds: ["type-note", "type-snippet", "type-link", "type-prompt"],
    createdAt: "2025-09-18",
  },
  {
    id: "collection-git-commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemTypeIds: ["type-command", "type-note"],
    createdAt: "2026-02-28",
  },
  {
    id: "collection-ai-prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemTypeIds: ["type-prompt", "type-snippet", "type-note"],
    createdAt: "2026-03-05",
  },
];

export function getRecentCollections(limit: number): Collection[] {
  return [...collections]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export const items: Item[] = [
  {
    id: "item-use-auth-hook",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    itemTypeId: "type-snippet",
    collectionIds: ["collection-react-patterns"],
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-01-15",
  },
  {
    id: "item-api-error-handling",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    itemTypeId: "type-snippet",
    collectionIds: ["collection-react-patterns", "collection-interview-prep"],
    tags: ["api", "error-handling"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-01-12",
  },
];
