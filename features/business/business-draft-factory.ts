import type {
  EmployeeDraft,
  EmployeeListDraft,
} from "@/features/business/business-draft-types";

function makeTempId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function newEmployee(): EmployeeDraft {
  return {
    tempId: makeTempId("employee"),
    fullName: "",
    jobTitle: "",
    amount: undefined,
    currency: "NGN",
    payFrequency: "monthly",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    accountVerified: false,
    accountVerifiedAt: undefined,
  };
}

export function newEmployeeList(): EmployeeListDraft {
  return {
    tempId: makeTempId("list"),
    name: "",
    description: "",
    currency: "NGN",
    payFrequency: "monthly",
    employees: [newEmployee()],
  };
}
