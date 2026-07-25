import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { changePassword, deleteAccount } from "@/actions/profile";

const mockedAuth = vi.mocked(auth);
const mockedFindUnique = vi.mocked(prisma.user.findUnique);
const mockedUpdate = vi.mocked(prisma.user.update);
const mockedDelete = vi.mocked(prisma.user.delete);
const mockedCompare = vi.mocked(bcrypt.compare);
const mockedHash = vi.mocked(bcrypt.hash);
const mockedSignOut = vi.mocked(signOut);

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("changePassword", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await changePassword(
      buildFormData({ currentPassword: "old", newPassword: "newpassword", confirmPassword: "newpassword" })
    );

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedFindUnique).not.toHaveBeenCalled();
  });

  it("rejects when the new password and confirmation don't match", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await changePassword(
      buildFormData({ currentPassword: "old", newPassword: "newpassword", confirmPassword: "different" })
    );

    expect(result).toEqual({ success: false, error: "Passwords do not match" });
  });

  it("rejects when the current password is incorrect", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedFindUnique.mockResolvedValue({ id: "user-1", password: "hashed" });
    mockedCompare.mockResolvedValue(false);

    const result = await changePassword(
      buildFormData({ currentPassword: "wrong", newPassword: "newpassword", confirmPassword: "newpassword" })
    );

    expect(result).toEqual({ success: false, error: "Current password is incorrect" });
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("updates the password hash on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedFindUnique.mockResolvedValue({ id: "user-1", password: "hashed" });
    mockedCompare.mockResolvedValue(true);
    mockedHash.mockResolvedValue("new-hashed");

    const result = await changePassword(
      buildFormData({ currentPassword: "old", newPassword: "newpassword", confirmPassword: "newpassword" })
    );

    expect(result).toEqual({ success: true });
    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "new-hashed" },
    });
  });
});

describe("deleteAccount", () => {
  it("rejects when there is no session", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue(null);

    const result = await deleteAccount();

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("deletes the user and signs out on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    await deleteAccount();

    expect(mockedDelete).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(mockedSignOut).toHaveBeenCalledWith({ redirectTo: "/sign-in?auth=account-deleted" });
  });
});
