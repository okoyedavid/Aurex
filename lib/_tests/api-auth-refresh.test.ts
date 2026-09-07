import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state: {
    rejectResponse?: (error: unknown) => Promise<unknown>;
  } = {};
  const apiClient = Object.assign(vi.fn(async (config: unknown) => config), {
    interceptors: {
      response: {
        use: vi.fn(
          (
            _fulfilled: (response: unknown) => unknown,
            rejected: (error: unknown) => Promise<unknown>,
          ) => {
            state.rejectResponse = rejected;
          },
        ),
      },
    },
  });
  const refreshClient = { post: vi.fn() };
  const create = vi
    .fn()
    .mockReturnValueOnce(apiClient)
    .mockReturnValueOnce(refreshClient);

  return { apiClient, create, refreshClient, state };
});

vi.mock("axios", () => ({ default: { create: mocks.create } }));

import { registerAuthFailureHandler } from "../api";

function unauthorized(config: Record<string, unknown>) {
  return { response: { status: 401 }, config };
}

describe("authenticated request refresh", () => {
  beforeEach(() => {
    mocks.apiClient.mockClear();
    mocks.refreshClient.post.mockReset();
  });

  it("shares one refresh request and retries each original request once", async () => {
    let finishRefresh: (() => void) | undefined;
    mocks.refreshClient.post.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishRefresh = resolve;
      }),
    );

    const first = mocks.state.rejectResponse!(unauthorized({ url: "/businesses" }));
    const second = mocks.state.rejectResponse!(unauthorized({ url: "/auth/me" }));
    finishRefresh?.();

    await Promise.all([first, second]);

    await mocks.state.rejectResponse!(unauthorized({ url: "/notifications" }));

    expect(mocks.refreshClient.post).toHaveBeenCalledTimes(1);
    expect(mocks.refreshClient.post).toHaveBeenCalledWith(
      "/auth/refresh",
      {},
      { headers: { "Content-Type": "application/json" } },
    );
    expect(mocks.apiClient).toHaveBeenCalledTimes(3);
  });

  it("clears the frontend session once when refresh fails", async () => {
    const onFailure = vi.fn();
    registerAuthFailureHandler(onFailure);
    mocks.refreshClient.post.mockRejectedValueOnce(new Error("expired"));
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 2_000);

    const first = mocks.state.rejectResponse!(unauthorized({ url: "/businesses" }));
    const second = mocks.state.rejectResponse!(unauthorized({ url: "/auth/me" }));

    await expect(first).rejects.toThrow("expired");
    await expect(second).rejects.toThrow("expired");
    expect(onFailure).toHaveBeenCalledTimes(1);
  });
});
