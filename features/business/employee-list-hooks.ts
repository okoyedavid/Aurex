"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as service from "@/lib/employee-lists-api";
import type { EmployeeListPayload } from "@/features/business/employee-list-form";

export const employeeListKeys = {
  root: (businessId: string) =>
    ["businesses", businessId, "employee-lists"] as const,
  collection: (businessId: string, page: number, limit: number) =>
    [
      ...employeeListKeys.root(businessId),
      { page, limit, filters: {} },
    ] as const,
  detail: (businessId: string, listId: string) =>
    [...employeeListKeys.root(businessId), listId] as const,
  employeesRoot: (businessId: string, listId: string) =>
    [...employeeListKeys.detail(businessId, listId), "employees"] as const,
  employees: (
    businessId: string,
    listId: string,
    page: number,
    limit: number,
  ) =>
    [
      ...employeeListKeys.employeesRoot(businessId, listId),
      { page, limit, filters: {} },
    ] as const,
  employee: (businessId: string, listId: string, employeeId: string) =>
    [
      ...employeeListKeys.employeesRoot(businessId, listId),
      employeeId,
    ] as const,
  verification: (businessId: string, listId: string) =>
    [
      ...employeeListKeys.detail(businessId, listId),
      "verification-status",
    ] as const,
};
function verificationPollInterval(pendingVerificationCount?: number) {
  return pendingVerificationCount && pendingVerificationCount > 0
    ? 3000
    : false;
}

export function useEmployeeListsQuery(
  businessId: string,
  page: number,
  limit: number,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeListKeys.collection(businessId, page, limit),
    queryFn: () => service.getEmployeeLists(businessId, page, limit),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}
export function useEmployeeListQuery(businessId: string, listId: string) {
  return useQuery({
    queryKey: employeeListKeys.detail(businessId, listId),
    queryFn: () => service.getEmployeeList(businessId, listId),
    enabled: Boolean(businessId && listId),
  });
}
export function useEmployeesQuery(
  businessId: string,
  listId: string,
  page: number,
  limit: number,
) {
  return useQuery({
    queryKey: employeeListKeys.employees(businessId, listId, page, limit),
    queryFn: () => service.getEmployees(businessId, listId, page, limit),
    enabled: Boolean(businessId && listId),
    placeholderData: keepPreviousData,
  });
}
export function useVerificationStatusQuery(businessId: string, listId: string) {
  return useQuery({
    queryKey: employeeListKeys.verification(businessId, listId),
    queryFn: () => service.getVerificationStatus(businessId, listId),
    enabled: Boolean(businessId && listId),
    refetchInterval: (query) =>
      verificationPollInterval(query.state.data?.pendingVerificationCount),
  });
}

export function useCreateEmployeeListMutation(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EmployeeListPayload) =>
      service.createEmployeeList(businessId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: employeeListKeys.root(businessId) }),
  });
}
export function useUpdateEmployeeListMutation(
  businessId: string,
  listId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: service.UpdateEmployeeListBody) =>
      service.updateEmployeeList(businessId, listId, body),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({
          queryKey: employeeListKeys.detail(businessId, listId),
        }),
        qc.invalidateQueries({ queryKey: employeeListKeys.root(businessId) }),
      ]),
  });
}
export function useCreateEmployeeMutation(businessId: string, listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof service.createEmployee>[2]) =>
      service.createEmployee(businessId, listId, body),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({
          queryKey: employeeListKeys.employeesRoot(businessId, listId),
        }),
        qc.invalidateQueries({
          queryKey: employeeListKeys.detail(businessId, listId),
        }),
        qc.invalidateQueries({
          queryKey: employeeListKeys.verification(businessId, listId),
        }),
        qc.invalidateQueries({ queryKey: employeeListKeys.root(businessId) }),
      ]),
  });
}
export function useUpdateEmployeeMutation(
  businessId: string,
  listId: string,
  employeeId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: service.UpdateEmployeeBody) =>
      service.updateEmployee(businessId, listId, employeeId, body),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({
          queryKey: employeeListKeys.employee(businessId, listId, employeeId),
        }),
        qc.invalidateQueries({
          queryKey: employeeListKeys.employeesRoot(businessId, listId),
        }),
        qc.invalidateQueries({
          queryKey: employeeListKeys.detail(businessId, listId),
        }),
        qc.invalidateQueries({
          queryKey: employeeListKeys.verification(businessId, listId),
        }),
        qc.invalidateQueries({ queryKey: employeeListKeys.root(businessId) }),
      ]),
  });
}
