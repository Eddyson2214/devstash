import { describe, expect, it } from "vitest";

import { sortFavoriteCollections, sortFavoriteItems } from "@/lib/sort-favorites";

const items = [
  { title: "Zebra Snippet", updatedAt: new Date("2026-01-01"), itemType: { name: "Snippet" } },
  { title: "Apple Link", updatedAt: new Date("2026-03-01"), itemType: { name: "Link" } },
  { title: "Mango Note", updatedAt: new Date("2026-02-01"), itemType: { name: "Note" } },
];

describe("sortFavoriteItems", () => {
  it("sorts alphabetically by title for 'name'", () => {
    const result = sortFavoriteItems(items, "name");

    expect(result.map((item) => item.title)).toEqual([
      "Apple Link",
      "Mango Note",
      "Zebra Snippet",
    ]);
  });

  it("sorts newest updatedAt first for 'date'", () => {
    const result = sortFavoriteItems(items, "date");

    expect(result.map((item) => item.title)).toEqual([
      "Apple Link",
      "Mango Note",
      "Zebra Snippet",
    ]);
  });

  it("sorts alphabetically by item type name for 'type'", () => {
    const result = sortFavoriteItems(items, "type");

    expect(result.map((item) => item.itemType.name)).toEqual(["Link", "Note", "Snippet"]);
  });

  it("does not mutate the original array", () => {
    const original = [...items];

    sortFavoriteItems(items, "name");

    expect(items).toEqual(original);
  });
});

const collections = [
  { name: "Zebra Collection", updatedAt: new Date("2026-01-01") },
  { name: "Apple Collection", updatedAt: new Date("2026-03-01") },
  { name: "Mango Collection", updatedAt: new Date("2026-02-01") },
];

describe("sortFavoriteCollections", () => {
  it("sorts alphabetically by name for 'name'", () => {
    const result = sortFavoriteCollections(collections, "name");

    expect(result.map((collection) => collection.name)).toEqual([
      "Apple Collection",
      "Mango Collection",
      "Zebra Collection",
    ]);
  });

  it("sorts newest updatedAt first for 'date'", () => {
    const result = sortFavoriteCollections(collections, "date");

    expect(result.map((collection) => collection.name)).toEqual([
      "Apple Collection",
      "Mango Collection",
      "Zebra Collection",
    ]);
  });

  it("leaves the order unchanged for 'type', since collections have no single item type", () => {
    const result = sortFavoriteCollections(collections, "type");

    expect(result).toBe(collections);
  });
});
