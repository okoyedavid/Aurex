import type { DefaultEmployeeTypeKey } from "@/lib/employee-classifications-api";

export type PayFrequency = "monthly" | "weekly" | "bi-weekly" | "one_time";

export type EmployeeDraft = {
  tempId: string;
  fullName: string;
  jobTitle?: string;
  amount?: number;
  currency?: string;
  payFrequency?: PayFrequency;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  accountVerified?: boolean;
  accountVerifiedAt?: string;
  employeeTypeId?: string | null;
  employeeTypeTemplateKey?: DefaultEmployeeTypeKey;
  groupIds?: string[];
  employmentStartDate?: string;
  state?: string;
};

export type EmployeeListDraft = {
  tempId: string;
  name: string;
  description?: string;
  currency?: string;
  payFrequency?: PayFrequency;
  employees: EmployeeDraft[];
};

export type CreateBusinessFormState = {
  name: string;
  industry: string;
};

export const emptyCreateBusinessForm: CreateBusinessFormState = {
  name: "",
  industry: "",
};
