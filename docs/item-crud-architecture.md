# Item CRUD Architecture (design)

This is a proposed design for a unified CRUD system covering all 7 item types (Snippet, Prompt, Command, Note, Link, File, Image — see [`docs/item-types.md`](item-types.md)). None of this exists yet: `src/app/items/[type]/page.tsx` is a placeholder that only prints the type name (backed by `mock-data.ts`, not Prisma), and there is no `src/actions/items.ts` or item-mutation code anywhere in the repo today. The design below follows the conventions already established by the auth/profile CRUD code (`src/actions/auth.ts`, `src/actions/profile.ts`, `src/lib/db/collections.ts`, `src/lib/db/items.ts`) so it drops into the codebase without introducing a second pattern.

## Guiding principle

One `Item` model, one route, one action file, one form — type only changes *rendering* and *validation shape*, never the storage path. This mirrors the schema: all 7 types are rows in the same `Item` table, distinguished by `itemTypeId` and `contentType` (`TEXT | URL | FILE`), per `prisma/schema.prisma`.

## File structure

```
src/
  actions/
    items.ts                 # createItem, updateItem, deleteItem, toggleFavorite, togglePinned
  lib/
    db/
      items.ts                # existing — extend with getItemsByType, getItemById
    item-schema.ts             # Zod schemas + ContentType-from-ItemType mapping (new, shared by actions + forms)
    type-icons.tsx             # existing — TYPE_ICONS, typeHref (no change needed)
  app/
    items/
      [type]/
        page.tsx               # existing route, rewritten to fetch real data
  components/
    items/
      ItemGrid.tsx             # shared list/grid, type-agnostic
      ItemCard.tsx             # shared card, adapts icon/color/preview by type
      ItemForm.tsx             # shared shell: title, description, tags, collections
      fields/
        TextContentField.tsx   # Snippet/Command/Note/Prompt — textarea (+ language select for Snippet/Command)
        UrlField.tsx            # Link — url input with fetch-title/favicon affordance
        FileUploadField.tsx     # File/Image — dropzone, Pro-gated
      ItemDetailDrawer.tsx      # quick-access drawer (view/edit), per project-overview.md
```

- **Mutations** (`create`/`update`/`delete`) live in **one file**, `src/actions/items.ts` — not split per type. A single `contentType`-aware `createItem` handles all 7 types because the Prisma write shape is identical (`Item.create({ data: {...} })`); only which fields are populated differs.
- **Queries** live in `src/lib/db/items.ts`, extending the existing exports (`getPinnedItems`, `getRecentItems`, `getItemStats`, `getItemTypesWithCounts`) with type-filtered variants. These are called directly from server components, never through an API route — consistent with `coding-standards.md`'s "Server components fetch directly with Prisma."
- **Routing** is one dynamic segment, `/items/[type]`, not seven static routes.
- **Components** hold all type-specific branching. Actions and db queries stay type-agnostic wherever the schema allows it.

## How `/items/[type]` routing works

1. The route param is a plural, lowercased slug (`snippets`, `prompts`, `commands`, `notes`, `links`, `files`, `images`) — the inverse of `typeHref()` in `src/lib/type-icons.tsx`, which builds sidebar links as `` `/items/${name.toLowerCase()}s` ``.
2. `page.tsx` resolves the slug back to an `ItemType` row by querying `prisma.itemType.findFirst({ where: { isSystem: true } })` and matching `typeHref(type.name) === `/items/${slug}`` (same matching logic already used against `mock-data.ts` — just needs to move to a real query, e.g. a new `getItemTypeBySlug(slug)` in `lib/db/items.ts`), and calls `notFound()` if nothing matches.
3. Once resolved, the page fetches that type's items via a new `getItemsByType(itemTypeId, userId)` in `lib/db/items.ts` and renders them through the **same** `ItemGrid`/`ItemCard` components used everywhere else — no per-type page variant.
4. The page also passes the resolved `ItemType` down as a prop so the "New Item" entry point (drawer or inline form) can pre-select that type without the user choosing it again — the same role `Collection.defaultTypeId` plays for collections.
5. `force-dynamic` (as already set on `dashboard/page.tsx`) applies here too, since item lists are per-user and mutate frequently.

## Where type-specific logic lives

Type-specific behavior is confined to **components**, never to `actions/items.ts` or `lib/db/items.ts`:

| Concern | Lives in | Type-agnostic? |
|---|---|---|
| Writing to the DB (`Item.create`/`update`/`delete`) | `actions/items.ts` | Yes — one code path for all types |
| Reading items (`getItemsByType`, `getPinnedItems`, etc.) | `lib/db/items.ts` | Yes — filters by `itemTypeId`, doesn't branch on it |
| Which form fields to show (content textarea vs. URL input vs. file dropzone) | `components/items/ItemForm.tsx` + `fields/*` | No — switches on `itemType.name` / `contentType` |
| Zod validation shape (content required vs. url required vs. file required) | `lib/item-schema.ts` | No — one schema per `contentType`, selected by the form/action based on the item's type, but still called from the single `createItem`/`updateItem` action |
| Card preview (code block, markdown render, link favicon, image thumbnail) | `components/items/ItemCard.tsx` | No — switches on `itemType.name` |
| Icon/color accents | `lib/type-icons.tsx` (`TYPE_ICONS`) + `itemType.color` | Already type-agnostic — just a lookup table |
| Pro gating (File/Image) | `ItemForm.tsx` / `FileUploadField.tsx` | No — only File/Image check `session.user.isPro` before allowing the field to submit |

The only place `actions/items.ts` needs to know about type at all is picking the right Zod schema from `lib/item-schema.ts` (keyed by `contentType`, itself derived from the selected `itemTypeId` — one small lookup, not per-type functions) before writing.

## Component responsibilities

- **`ItemForm.tsx`** — owns `title`, `description`, `tags`, `collections` (fields shared by every type), and an item-type selector. Based on the selected type's `contentType`, it renders exactly one of `TextContentField`, `UrlField`, or `FileUploadField` in the body. Submits to the single `createItem`/`updateItem` server action.
- **`fields/TextContentField.tsx`** — textarea for `content`; shows a language `<select>` only when `itemType.name` is `Snippet` or `Command` (Prompt/Note omit it, matching the seed-data convention already observed in `prisma/sampledata.ts`).
- **`fields/UrlField.tsx`** — single `url` input, used only by Link.
- **`fields/FileUploadField.tsx`** — dropzone wired to the future R2 upload API; disabled/upsell state when `!session.user.isPro`, matching the existing sidebar "PRO" badge treatment on File/Image (`AppSidebar.tsx`).
- **`ItemGrid.tsx`** — layout only (grid/list), maps items to `ItemCard`, handles empty state. No type branching.
- **`ItemCard.tsx`** — the one place per-type *preview* rendering happens: syntax-highlighted snippet of `content` for Snippet/Command, rendered markdown excerpt for Note, plain excerpt for Prompt, domain/favicon for Link, thumbnail for Image, filename/size for File. Everything else (border/icon color, pin/favorite, tags, date) is identical to the existing `ItemList.tsx` card, which this replaces/extends.
- **`ItemDetailDrawer.tsx`** — the "quick-access drawer" called for in `project-overview.md`; opens on card click, shows the full content plus edit/delete actions, reusing `ItemForm` in edit mode.
- **`actions/items.ts`** — `createItem`, `updateItem`, `deleteItem`, `toggleFavorite`, `togglePinned`. Each follows the existing `{ success, data?, error? }` return convention (`coding-standards.md`), validates with the schema from `lib/item-schema.ts`, and scopes every query to `session.user.id` via `auth()` — the same session-scoping already used in `actions/profile.ts`, closing the gap noted in `current-feature.md` where `lib/db/items.ts` and `lib/db/collections.ts` still read a hardcoded `DEMO_USER_EMAIL` instead of the session user.

## Open items for implementation (not decided here)

- Whether `getItemsByType` takes the resolved session user server-side (recommended) or still needs the `DEMO_USER_EMAIL` stand-in removed first — the latter is pre-existing tech debt independent of this design.
- Exact Zod schema shapes belong in `lib/item-schema.ts` at implementation time, not in this research doc.
- File/Image upload wiring depends on the not-yet-built R2 upload API (`UploadAPI` in the architecture diagram in `project-overview.md`) and is out of scope for the CRUD action itself beyond storing the returned `fileUrl`/`fileName`/`fileSize`.
