export const demoUser = {
  email: "demo@devstash.io",
  name: "Demo User",
  password: "dev-demo-p4ssw0rd!", // hashed with bcryptjs at seed time, never stored in plaintext
  isPro: false,
};

export interface SeedItem {
  title: string;
  description: string;
  itemType: string; // matches a name in systemItemTypes
  contentType: "TEXT" | "URL" | "FILE";
  content?: string;
  url?: string;
  language?: string;
  tags: string[];
}

export interface SeedCollection {
  name: string;
  description: string;
  items: SeedItem[];
}

export const seedCollections: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        title: "Custom Hooks: useDebounce & useLocalStorage",
        description: "Debounce a fast-changing value and persist state to localStorage.",
        itemType: "Snippet",
        contentType: "TEXT",
        language: "typescript",
        tags: ["react", "hooks", "typescript"],
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
      {
        title: "Component Patterns: Context Provider & Compound Components",
        description: "A compound-component Tabs implementation backed by context.",
        itemType: "Snippet",
        contentType: "TEXT",
        language: "typescript",
        tags: ["react", "patterns", "context", "typescript"],
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used within <Tabs>");
  return ctx;
}

export function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button role="tab" aria-selected={activeTab === value} onClick={() => setActiveTab(value)}>
      {children}
    </button>
  );
};`,
      },
      {
        title: "Utility Functions",
        description: "Small, dependency-free array/object helpers used across the app.",
        itemType: "Snippet",
        contentType: "TEXT",
        language: "typescript",
        tags: ["typescript", "utilities"],
        content: `export function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

export function groupBy<T, K extends string | number>(
  items: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {} as Pick<T, K>);
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code Review Prompt",
        description: "Structured prompt for thorough, focused code review.",
        itemType: "Prompt",
        contentType: "TEXT",
        tags: ["ai", "code-review", "prompt-engineering"],
        content: `Review the following code for correctness, security issues, and adherence to best practices. For each issue found, explain the problem and suggest a specific fix. Focus on: logic errors, edge cases, security vulnerabilities (injection, auth bypass), and performance. Skip style nitpicks unless they affect readability significantly.

Code:
\`\`\`
{{code}}
\`\`\``,
      },
      {
        title: "Documentation Generator Prompt",
        description: "Generates JSDoc/TSDoc-style documentation for a function or module.",
        itemType: "Prompt",
        contentType: "TEXT",
        tags: ["ai", "documentation", "prompt-engineering"],
        content: `Generate clear, concise documentation for the following function/module. Include: a one-sentence summary, parameter descriptions with types, return value description, and one usage example. Match the style of JSDoc/TSDoc comments. Do not restate the obvious from type signatures.

Code:
\`\`\`
{{code}}
\`\`\``,
      },
      {
        title: "Refactoring Assistant Prompt",
        description: "Prompt for behavior-preserving refactors with explained changes.",
        itemType: "Prompt",
        contentType: "TEXT",
        tags: ["ai", "refactoring", "prompt-engineering"],
        content: `Refactor the following code to improve readability and reduce duplication, without changing its external behavior. Explain each change you make and why. Preserve existing naming conventions unless they are misleading. Flag any change that could alter behavior instead of making it silently.

Code:
\`\`\`
{{code}}
\`\`\``,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Production Dockerfile",
        description: "Multi-stage-ready Dockerfile for a Next.js production build.",
        itemType: "Snippet",
        contentType: "TEXT",
        language: "dockerfile",
        tags: ["docker", "ci-cd", "devops"],
        content: `FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        title: "Deploy to Production",
        description: "Applies pending migrations, rebuilds, and reloads the app.",
        itemType: "Command",
        contentType: "TEXT",
        language: "bash",
        tags: ["deployment", "devops", "ci-cd"],
        content: `npx prisma migrate deploy && npm run build && pm2 reload ecosystem.config.js --env production`,
      },
      {
        title: "Docker Documentation",
        description: "Official Docker documentation.",
        itemType: "Link",
        contentType: "URL",
        url: "https://docs.docker.com/",
        tags: ["docker", "documentation"],
      },
      {
        title: "GitHub Actions Documentation",
        description: "Official GitHub Actions documentation.",
        itemType: "Link",
        contentType: "URL",
        url: "https://docs.github.com/en/actions",
        tags: ["ci-cd", "documentation"],
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Common Git Operations",
        description: "Everyday git branch/commit/rebase workflow.",
        itemType: "Command",
        contentType: "TEXT",
        language: "bash",
        tags: ["git"],
        content: `git switch -c feature/my-feature
git add -p
git commit -m "feat: ..."
git push -u origin feature/my-feature
git rebase -i origin/main`,
      },
      {
        title: "Docker Commands Cheat Sheet",
        description: "Common docker/compose inspection and cleanup commands.",
        itemType: "Command",
        contentType: "TEXT",
        language: "bash",
        tags: ["docker"],
        content: `docker ps -a
docker compose up -d --build
docker exec -it <container> sh
docker logs -f <container>
docker system prune -af`,
      },
      {
        title: "Process Management",
        description: "Find and manage processes bound to a port.",
        itemType: "Command",
        contentType: "TEXT",
        language: "bash",
        tags: ["process-management"],
        content: `lsof -i :3000
kill -9 $(lsof -t -i:3000)
ps aux | grep node
top -o %CPU`,
      },
      {
        title: "Package Manager Utilities",
        description: "Keep npm dependencies clean and up to date.",
        itemType: "Command",
        contentType: "TEXT",
        language: "bash",
        tags: ["npm", "package-manager"],
        content: `npm outdated
npm dedupe
npx npm-check-updates -u
npm ci
npm ls --depth=0`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS Documentation",
        description: "Utility-first CSS framework reference.",
        itemType: "Link",
        contentType: "URL",
        url: "https://tailwindcss.com/docs",
        tags: ["css", "tailwind"],
      },
      {
        title: "shadcn/ui",
        description: "Composable component library built on Radix/Base UI.",
        itemType: "Link",
        contentType: "URL",
        url: "https://ui.shadcn.com",
        tags: ["components", "ui-library"],
      },
      {
        title: "Material Design 3",
        description: "Google's design system guidelines.",
        itemType: "Link",
        contentType: "URL",
        url: "https://m3.material.io",
        tags: ["design-system"],
      },
      {
        title: "Lucide Icons",
        description: "Open-source icon library.",
        itemType: "Link",
        contentType: "URL",
        url: "https://lucide.dev",
        tags: ["icons"],
      },
    ],
  },
];
