import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteCloudinaryUpload,
  uploadAvatarWithRollback,
} from "./cloudinary-upload";

describe("Cloudinary upload rollback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("keeps the delete token returned with an upload", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", "unsigned");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            secure_url: "https://res.cloudinary.com/demo/image/upload/logo.png",
            delete_token: "short-lived-token",
          }),
      }),
    );

    const upload = await uploadAvatarWithRollback({
      type: "image/png",
      size: 5,
    } as File);

    expect(upload).toEqual({
      url: "https://res.cloudinary.com/demo/image/upload/logo.png",
      deleteToken: "short-lived-token",
    });
  });

  it("posts the token to Cloudinary's unauthenticated delete endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await deleteCloudinaryUpload("short-lived-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/delete_by_token",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "short-lived-token" }),
      }),
    );
  });
});
