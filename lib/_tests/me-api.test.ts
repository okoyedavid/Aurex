import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { getMe } from "../me-api";

describe("getMe", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reads the user only from the canonical data field", async () => {
    const user = {
      id: "user-1",
      name: "Okoye David",
      email: "david@example.com",
      emailVerifiedAt: null,
      status: "active" as const,
      preferences: { twoFactorEnabled: false },
      createdAt: "2026-06-27T23:34:16.560Z",
      updatedAt: "2026-06-27T23:34:18.701Z",
    };
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: {
        data: user,
        message: "user successfully retrieved",
        success: true,
        user: { ...user, id: "legacy-user" },
      },
    });

    await expect(getMe()).resolves.toEqual(user);
  });
});
