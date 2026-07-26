import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/settings", () => ({
  updateEditorPreferences: vi.fn(),
}));

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/settings";
import { updateEditorPreferences } from "@/actions/settings";

const mockedAuth = vi.mocked(auth);
const mockedUpdateEditorPreferencesQuery = vi.mocked(updateEditorPreferencesQuery);

const validPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "monokai",
} as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateEditorPreferences", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await updateEditorPreferences(validPreferences);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedUpdateEditorPreferencesQuery).not.toHaveBeenCalled();
  });

  it("rejects an invalid font size", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    // @ts-expect-error - intentionally invalid font size to exercise validation
    const result = await updateEditorPreferences({ ...validPreferences, fontSize: 999 });

    expect(result).toEqual({ success: false, error: "Invalid font size" });
    expect(mockedUpdateEditorPreferencesQuery).not.toHaveBeenCalled();
  });

  it("rejects an invalid tab size", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    // @ts-expect-error - intentionally invalid tab size to exercise validation
    const result = await updateEditorPreferences({ ...validPreferences, tabSize: 3 });

    expect(result).toEqual({ success: false, error: "Invalid tab size" });
    expect(mockedUpdateEditorPreferencesQuery).not.toHaveBeenCalled();
  });

  it("rejects an invalid theme", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    // @ts-expect-error - intentionally invalid theme to exercise validation
    const result = await updateEditorPreferences({ ...validPreferences, theme: "solarized" });

    expect(result.success).toBe(false);
    expect(mockedUpdateEditorPreferencesQuery).not.toHaveBeenCalled();
  });

  it("updates the preferences and returns them on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedUpdateEditorPreferencesQuery.mockResolvedValue(validPreferences);

    const result = await updateEditorPreferences(validPreferences);

    expect(result).toEqual({ success: true, data: validPreferences });
    expect(mockedUpdateEditorPreferencesQuery).toHaveBeenCalledWith("user-1", validPreferences);
  });
});
