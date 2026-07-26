import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  getAllCollections: vi.fn(),
}));

import { auth } from "@/auth";
import { createCollection as createCollectionQuery, getAllCollections } from "@/lib/db/collections";
import { createCollection, listCollections } from "@/actions/collections";

const mockedAuth = vi.mocked(auth);
const mockedCreateCollectionQuery = vi.mocked(createCollectionQuery);
const mockedGetAllCollections = vi.mocked(getAllCollections);

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
