import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  createItem: vi.fn(),
  getItemTypeBySlug: vi.fn(),
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn(),
  keyFromFileUrl: vi.fn((fileUrl: string) => new URL(fileUrl).pathname.replace(/^\/+/, "")),
}));

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  getItemTypeBySlug,
  updateItem as updateItemQuery,
} from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";
import { createItem, deleteItem, updateItem } from "@/actions/items";

const mockedAuth = vi.mocked(auth);
const mockedUpdateItemQuery = vi.mocked(updateItemQuery);
const mockedDeleteItemQuery = vi.mocked(deleteItemQuery);
const mockedCreateItemQuery = vi.mocked(createItemQuery);
const mockedGetItemTypeBySlug = vi.mocked(getItemTypeBySlug);
const mockedDeleteFromR2 = vi.mocked(deleteFromR2);

const validInput = {
  title: "Updated title",
  description: null,
  content: null,
  url: null,
  language: null,
  tags: ["react", "hooks"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateItem", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedUpdateItemQuery).not.toHaveBeenCalled();
  });

  it("rejects an empty title before hitting the database", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await updateItem("item-1", { ...validInput, title: "   " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockedUpdateItemQuery).not.toHaveBeenCalled();
  });

  it("rejects an invalid URL before hitting the database", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await updateItem("item-1", { ...validInput, url: "not-a-url" });

    expect(result).toEqual({ success: false, error: "Enter a valid URL" });
    expect(mockedUpdateItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the item doesn't exist or isn't owned by the session user", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedUpdateItemQuery.mockResolvedValue(null);

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("updates the item and returns the fresh detail on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    const updated = { id: "item-1", title: "Updated title", tags: ["react", "hooks"] };
    mockedUpdateItemQuery.mockResolvedValue(updated);

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({ success: true, data: updated });
    expect(mockedUpdateItemQuery).toHaveBeenCalledWith("item-1", "user-1", {
      ...validInput,
      collectionIds: [],
    });
  });

  it("passes through the selected collection ids", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedUpdateItemQuery.mockResolvedValue({ id: "item-1" });

    await updateItem("item-1", { ...validInput, collectionIds: ["collection-1", "collection-2"] });

    expect(mockedUpdateItemQuery).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({ collectionIds: ["collection-1", "collection-2"] })
    );
  });
});

describe("deleteItem", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedDeleteItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the item doesn't exist or isn't owned by the session user", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedDeleteItemQuery.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(mockedDeleteFromR2).not.toHaveBeenCalled();
  });

  it("deletes the item on success and skips R2 cleanup when there was no file", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedDeleteItemQuery.mockResolvedValue({ fileUrl: null });

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockedDeleteItemQuery).toHaveBeenCalledWith("item-1", "user-1");
    expect(mockedDeleteFromR2).not.toHaveBeenCalled();
  });

  it("deletes the R2 object when the item had an uploaded file", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedDeleteItemQuery.mockResolvedValue({
      fileUrl: "https://pub-example.r2.dev/user-1/abc-notes.pdf",
    });

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockedDeleteFromR2).toHaveBeenCalledWith("user-1/abc-notes.pdf");
  });
});

const validCreateInput = {
  type: "snippet" as const,
  title: "New snippet",
  description: null,
  content: "console.log('hi')",
  url: null,
  language: "typescript",
  fileUrl: null,
  fileName: null,
  fileSize: null,
  tags: ["react"],
};

describe("createItem", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await createItem(validCreateInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedCreateItemQuery).not.toHaveBeenCalled();
  });

  it("rejects an empty title before hitting the database", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({ ...validCreateInput, title: "   " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockedCreateItemQuery).not.toHaveBeenCalled();
  });

  it("rejects a link item with no URL", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({ ...validCreateInput, type: "link", url: null });

    expect(result).toEqual({ success: false, error: "URL is required" });
    expect(mockedCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the item type can't be resolved", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedGetItemTypeBySlug.mockResolvedValue(null);

    const result = await createItem(validCreateInput);

    expect(result).toEqual({ success: false, error: "Invalid item type" });
    expect(mockedCreateItemQuery).not.toHaveBeenCalled();
  });

  it("creates the item with the resolved item type and TEXT content type", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedGetItemTypeBySlug.mockResolvedValue({ id: "type-1", name: "Snippet" });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    const created = { id: "item-1", title: "New snippet" };
    mockedCreateItemQuery.mockResolvedValue(created);

    const result = await createItem(validCreateInput);

    expect(result).toEqual({ success: true, data: created });
    expect(mockedGetItemTypeBySlug).toHaveBeenCalledWith("snippets");
    expect(mockedCreateItemQuery).toHaveBeenCalledWith("user-1", {
      title: "New snippet",
      description: null,
      content: "console.log('hi')",
      contentType: "TEXT",
      url: null,
      language: "typescript",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      tags: ["react"],
      itemTypeId: "type-1",
      collectionIds: [],
    });
  });

  it("passes through the selected collection ids", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedGetItemTypeBySlug.mockResolvedValue({ id: "type-1", name: "Snippet" });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedCreateItemQuery.mockResolvedValue({ id: "item-1" });

    await createItem({
      ...validCreateInput,
      collectionIds: ["collection-1", "collection-2"],
    });

    expect(mockedCreateItemQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ collectionIds: ["collection-1", "collection-2"] })
    );
  });

  it("uses URL content type for link items", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedGetItemTypeBySlug.mockResolvedValue({ id: "type-2", name: "Link" });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedCreateItemQuery.mockResolvedValue({ id: "item-2" });

    await createItem({
      ...validCreateInput,
      type: "link",
      content: null,
      language: null,
      url: "https://example.com",
    });

    expect(mockedGetItemTypeBySlug).toHaveBeenCalledWith("links");
    expect(mockedCreateItemQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ contentType: "URL", url: "https://example.com" })
    );
  });

  it("rejects a file item with no uploaded file", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({
      ...validCreateInput,
      type: "file",
      content: null,
      language: null,
      fileUrl: null,
    });

    expect(result).toEqual({ success: false, error: "A file is required" });
    expect(mockedCreateItemQuery).not.toHaveBeenCalled();
  });

  it("uses FILE content type for image items and passes through the upload fields", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedGetItemTypeBySlug.mockResolvedValue({ id: "type-3", name: "Image" });
    // @ts-expect-error - minimal mock, only the fields the test asserts on
    mockedCreateItemQuery.mockResolvedValue({ id: "item-3" });

    await createItem({
      ...validCreateInput,
      type: "image",
      content: null,
      language: null,
      fileUrl: "https://pub-example.r2.dev/user-1/abc-photo.png",
      fileName: "photo.png",
      fileSize: 2048,
    });

    expect(mockedGetItemTypeBySlug).toHaveBeenCalledWith("images");
    expect(mockedCreateItemQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        contentType: "FILE",
        fileUrl: "https://pub-example.r2.dev/user-1/abc-photo.png",
        fileName: "photo.png",
        fileSize: 2048,
      })
    );
  });
});
