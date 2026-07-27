# Item Types

DevStash has 7 system item types. All are seeded via [`prisma/typesystem.ts`](../prisma/typesystem.ts) as `ItemType` rows with `isSystem: true` and `userId: null` — they are shared, cannot be edited or deleted by users, and are distinct from the planned (post-MVP, Pro) user-defined custom types.

## Per-type reference

| Type | Icon (lucide) | Color | `contentType` | Purpose | Key fields used |
|---|---|---|---|---|---|
| **Snippet** | `Code` | `#3b82f6` (blue) | `TEXT` | Syntax-highlighted code | `content`, `language` |
| **Prompt** | `Sparkles` | `#8b5cf6` (purple) | `TEXT` | AI prompts | `content` |
| **Command** | `Terminal` | `#f97316` (orange) | `TEXT` | Terminal commands | `content`, `language` (e.g. `bash`) |
| **Note** | `StickyNote` | `#fde047` (yellow) | `TEXT` | Markdown notes | `content` |
| **Link** | `Link` | `#10b981` (emerald) | `URL` | Bookmarked links | `url` |
| **File** | `File` | `#6b7280` (gray) | `FILE` | Uploaded files — **Pro only** | `fileUrl`, `fileName`, `fileSize` |
| **Image** | `Image` | `#ec4899` (pink) | `FILE` | Uploaded images — **Pro only** | `fileUrl`, `fileName`, `fileSize` |

Icon names map to `lucide-react` components via `TYPE_ICONS` in [`src/lib/type-icons.tsx`](../src/lib/type-icons.tsx). The route slug for each type is derived by `typeHref()` in the same file: lowercase the name and append `s` (e.g. `Snippet` → `/items/snippets`).

Note: `prisma/sampledata.ts` currently only seeds demo items for **Snippet**, **Prompt**, **Command**, and **Link** — no seed data exists yet for Note, File, or Image.

## Classification: text vs. file vs. URL

The `Item.contentType` enum (`TEXT | URL | FILE`) groups the 7 types into 3 storage shapes:

- **`TEXT`** — Snippet, Prompt, Command, Note. Content lives in `Item.content` (a plain string column). `language` is additionally set for Snippet and Command (used for syntax highlighting); Prompt and Note leave it unset.
- **`URL`** — Link. Content lives in `Item.url`; `content` is null.
- **`FILE`** — File, Image. Content lives in Cloudflare R2, referenced by `Item.fileUrl`/`fileName`/`fileSize`; `content` and `url` are null.

At the schema level, Note is **not** distinct from Snippet/Command/Prompt — all four share the same `TEXT` contentType and the same `content` column. They differ only in `itemType` (icon/color) and, in the UI, in how that content is expected to be rendered (Note as markdown, Snippet/Command as syntax-highlighted code, Prompt as plain text). This is one of the open questions flagged in `context/project-overview.md`.

## Shared properties

Every `Item`, regardless of type, has:

- `title`, `description` (optional)
- `isFavorite`, `isPinned` (booleans, default `false`)
- `tags` (many-to-many via the implicit `ItemTags` relation)
- `collections` (many-to-many via the explicit `ItemCollection` join table, with `addedAt`)
- `itemType` (required FK to `ItemType`, carries `name`/`icon`/`color`)
- `createdAt` / `updatedAt`
- `userId` (owner)

## Display differences (current implementation)

- **Dashboard item cards** ([`ItemList.tsx`](../src/components/dashboard/ItemList.tsx)): left border and icon-background wash tinted with `itemType.color` (`${color}1a` alpha), icon looked up from `TYPE_ICONS[itemType.icon]`, title with pin/favorite indicator icons, truncated description, tags as badges, formatted `createdAt`. This rendering is identical across all 7 types — none of the type-specific fields (`content`, `url`, `fileUrl`, `language`) are read yet at this layer.
- **Sidebar** ([`AppSidebar.tsx`](../src/components/dashboard/AppSidebar.tsx)): each type listed with its icon (tinted via inline `style={{ color }}`), name, and a live item count badge. File and Image additionally render an outlined "PRO" `Badge` next to the name (hidden when the sidebar is collapsed to icon-only mode) — the only type-specific UI branch that currently exists.
- **`/items/[type]` route** ([`src/app/items/[type]/page.tsx`](../src/app/items/[type]/page.tsx)): currently a placeholder that resolves the slug back to an `ItemType` (via `mock-data.ts`, not yet wired to Prisma) and renders only the type name — no per-type content rendering (code viewer, markdown renderer, link preview, file/image preview) has been built yet.

## Monetization gating

Per `context/project-overview.md`, File and Image are Pro-only in the target pricing model. Today this is only reflected as a visual "PRO" badge in the sidebar — there is no enforcement (upload blocking, item-type filtering) yet, consistent with the project's dev-mode note to leave features unlocked for testing until billing goes live.
