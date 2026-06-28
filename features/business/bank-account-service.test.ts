import { describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { resolveBankAccount } from "./bank-account-service";

describe("resolveBankAccount", () => {
  it("returns the backend account response contract", async () => {
    const data = {
      accountNumber: "5801017089",
      accountName: "Ada Okafor",
      bankId: 1,
    };
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: { data } });

    await expect(
      resolveBankAccount({ bankCode: "058", accountNumber: "5801017089" }),
    ).resolves.toMatchObject({
      accountNumber: "5801017089",
      accountName: "Ada Okafor",
    });
  });
});
