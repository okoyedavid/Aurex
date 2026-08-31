import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import {
  acceptInvite,
  approveInvite,
  createInvite,
  getPendingApprovals,
} from "./access-api";

describe("invitation API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("creates a MEMBER invitation with its discriminant", async () => {
    const payload = {
      type: "MEMBER" as const,
      email: "member@example.com",
      roleId: "role-viewer",
    };
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { data: { id: "invite-1" } } });

    await createInvite("business-1", payload);

    expect(post).toHaveBeenCalledWith("/businesses/business-1/invites", payload);
  });

  it("creates an EMPLOYEE invitation with only the selected employee ID", async () => {
    const payload = {
      type: "EMPLOYEE" as const,
      email: "employee@example.com",
      roleId: "role-employee",
      employeeId: "employee-7",
    };
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { data: { id: "invite-2" } } });

    await createInvite("business-1", payload);

    expect(post).toHaveBeenCalledWith("/businesses/business-1/invites", payload);
    expect(post.mock.calls[0]?.[1]).not.toHaveProperty("employeeListId");
  });

  it("creates a new-employee invitation without employee identifiers", async () => {
    const payload = {
      type: "EMPLOYEE" as const,
      email: "new@example.com",
      roleId: "role-employee",
    };
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { data: { id: "invite-3" } } });

    await createInvite("business-1", payload);

    expect(post).toHaveBeenCalledWith("/businesses/business-1/invites", payload);
    expect(post.mock.calls[0]?.[1]).not.toHaveProperty("employeeId");
    expect(post.mock.calls[0]?.[1]).not.toHaveProperty("employeeListId");
  });

  it("approves an existing employee with an explicit empty body", async () => {
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { data: { id: "invite-4" } } });

    await approveInvite("business-1", "invite-4", {});

    expect(post).toHaveBeenCalledWith(
      "/businesses/business-1/invites/invite-4/approve",
      {},
    );
  });

  it("places employeeListId inside the new employee approval payload", async () => {
    const payload = {
      employee: {
        employeeListId: "list-2",
        fullName: "Jane Doe",
        jobTitle: "Intern",
        bankCode: "058",
        bankName: "Example Bank",
        accountNumber: "0123456789",
        amount: 75_000,
        currency: "NGN",
        payFrequency: "monthly" as const,
      },
    };
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { data: { id: "invite-5" } } });

    await approveInvite("business-1", "invite-5", payload);

    expect(post).toHaveBeenCalledWith(
      "/businesses/business-1/invites/invite-5/approve",
      payload,
    );
  });

  it("preserves all acceptance metadata fields", async () => {
    const meta = {
      membershipActivated: true,
      membershipCreated: false,
      requiresApproval: false,
    };
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: { data: { id: "invite-6" }, message: "Accepted", meta },
    });

    await expect(acceptInvite("invite-6")).resolves.toMatchObject({ meta });
  });

  it.each([400, 403, 404, 409])(
    "preserves a %s backend validation status",
    async (status) => {
      const error = new AxiosError("Request failed");
      error.response = {
        status,
        data: { message: `Backend ${status}` },
      } as AxiosResponse;
      vi.spyOn(api, "get").mockRejectedValueOnce(error);

      await expect(getPendingApprovals("business-1", 1, 20)).rejects.toMatchObject(
        { status, message: `Backend ${status}` },
      );
    },
  );
});
