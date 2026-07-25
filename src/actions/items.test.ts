import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { auth } from "@/auth";
import { deleteItem as deleteItemQuery, updateItem as updateItemQuery } from "@/lib/db/items";
import { deleteItem, updateItem } from "@/actions/items";

const mockedAuth = vi.mocked(auth);
const mockedUpdateItemQuery = vi.mocked(updateItemQuery);
const mockedDeleteItemQuery = vi.mocked(deleteItemQuery);

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
    expect(mockedUpdateItemQuery).toHaveBeenCalledWith("item-1", "user-1", validInput);
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
    mockedDeleteItemQuery.mockResolvedValue(false);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("deletes the item on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedDeleteItemQuery.mockResolvedValue(true);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockedDeleteItemQuery).toHaveBeenCalledWith("item-1", "user-1");
  });
});
