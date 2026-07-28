import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  getAllCollections: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  toggleCollectionFavorite: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  getAllCollections,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
  updateCollection as updateCollectionQuery,
} from "@/lib/db/collections";
import {
  createCollection,
  deleteCollection,
  listCollections,
  toggleCollectionFavorite,
  updateCollection,
} from "@/actions/collections";

const mockedAuth = vi.mocked(auth);
const mockedCreateCollectionQuery = vi.mocked(createCollectionQuery);
const mockedGetAllCollections = vi.mocked(getAllCollections);
const mockedUpdateCollectionQuery = vi.mocked(updateCollectionQuery);
const mockedDeleteCollectionQuery = vi.mocked(deleteCollectionQuery);
const mockedToggleCollectionFavoriteQuery = vi.mocked(toggleCollectionFavoriteQuery);

const validInput = {
  name: "React Patterns",
  description: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCollection", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await createCollection(validInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedCreateCollectionQuery).not.toHaveBeenCalled();
  });

  it("rejects an empty name before hitting the database", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createCollection({ ...validInput, name: "   " });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockedCreateCollectionQuery).not.toHaveBeenCalled();
  });

  it("creates the collection and returns it on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    const created = { id: "collection-1", name: "React Patterns", description: null };
    mockedCreateCollectionQuery.mockResolvedValue(created);

    const result = await createCollection(validInput);

    expect(result).toEqual({ success: true, data: created });
    expect(mockedCreateCollectionQuery).toHaveBeenCalledWith("user-1", validInput);
  });

  it("passes a trimmed description through when provided", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    const created = { id: "collection-1", name: "React Patterns", description: "UI patterns" };
    mockedCreateCollectionQuery.mockResolvedValue(created);

    const result = await createCollection({ name: "React Patterns", description: "UI patterns" });

    expect(result).toEqual({ success: true, data: created });
    expect(mockedCreateCollectionQuery).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "UI patterns",
    });
  });
});

describe("listCollections", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await listCollections();

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedGetAllCollections).not.toHaveBeenCalled();
  });

  it("returns the session user's collections on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    const collections = [{ id: "collection-1", name: "React Patterns" }];
    mockedGetAllCollections.mockResolvedValue(collections);

    const result = await listCollections();

    expect(result).toEqual({ success: true, data: collections });
    expect(mockedGetAllCollections).toHaveBeenCalledWith("user-1");
  });
});

describe("updateCollection", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await updateCollection("collection-1", validInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedUpdateCollectionQuery).not.toHaveBeenCalled();
  });

  it("rejects an empty name before hitting the database", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await updateCollection("collection-1", { ...validInput, name: "   " });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockedUpdateCollectionQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the collection isn't found or isn't owned by the user", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedUpdateCollectionQuery.mockResolvedValue(null);

    const result = await updateCollection("collection-1", validInput);

    expect(result).toEqual({ success: false, error: "Collection not found" });
  });

  it("updates the collection and returns it on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    const updated = { id: "collection-1", name: "React Patterns", description: null };
    mockedUpdateCollectionQuery.mockResolvedValue(updated);

    const result = await updateCollection("collection-1", validInput);

    expect(result).toEqual({ success: true, data: updated });
    expect(mockedUpdateCollectionQuery).toHaveBeenCalledWith("collection-1", "user-1", validInput);
  });
});

describe("deleteCollection", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedDeleteCollectionQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the collection isn't found or isn't owned by the user", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedDeleteCollectionQuery.mockResolvedValue(false);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Collection not found" });
  });

  it("deletes the collection on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedDeleteCollectionQuery.mockResolvedValue(true);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: true });
    expect(mockedDeleteCollectionQuery).toHaveBeenCalledWith("collection-1", "user-1");
  });
});

describe("toggleCollectionFavorite", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await toggleCollectionFavorite("collection-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedToggleCollectionFavoriteQuery).not.toHaveBeenCalled();
  });

  it("returns an error when the collection isn't found or isn't owned by the user", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedToggleCollectionFavoriteQuery.mockResolvedValue(null);

    const result = await toggleCollectionFavorite("collection-1");

    expect(result).toEqual({ success: false, error: "Collection not found" });
  });

  it("toggles the collection's favorite state and returns the new value", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedToggleCollectionFavoriteQuery.mockResolvedValue(true);

    const result = await toggleCollectionFavorite("collection-1");

    expect(result).toEqual({ success: true, isFavorite: true });
    expect(mockedToggleCollectionFavoriteQuery).toHaveBeenCalledWith("collection-1", "user-1");
  });
});
