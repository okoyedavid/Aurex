import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getGoogleCallbackResult,
  removeGoogleCallbackResult,
} from "./components/google-auth-callback";
import { getGoogleAuthUrl, logout } from "@/lib/auth-api";
import { api } from "@/lib/api";

describe("Google authentication routing", () => {
  afterEach(() => vi.restoreAllMocks());

  it("starts OAuth at the backend authorization route", () => {
    expect(getGoogleAuthUrl("http://localhost:5000/api")).toBe(
      "http://localhost:5000/api/auth/google",
    );
  });

  it("recognizes only supported callback results", () => {
    expect(getGoogleCallbackResult("http://localhost:3000/?google=success")).toBe("success");
    expect(getGoogleCallbackResult("http://localhost:3000/?google=error")).toBe("error");
    expect(getGoogleCallbackResult("http://localhost:3000/?google=unknown")).toBeNull();
  });

  it("removes only the Google result parameter", () => {
    expect(
      removeGoogleCallbackResult(
        "http://localhost:3000/?campaign=warp&google=success#overview",
      ),
    ).toBe("/?campaign=warp#overview");
  });

  it("logs out through the cookie session endpoint with an empty JSON body", async () => {
    const request = vi.spyOn(api, "post").mockResolvedValueOnce({});

    await logout();

    expect(request).toHaveBeenCalledWith(
      "/auth/logout",
      {},
      { _skipAuthRefresh: true },
    );
  });
});
