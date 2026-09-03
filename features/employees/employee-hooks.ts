"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as service from "@/lib/employees-api";
import { auditKeys } from "@/features/audit/audit-hooks";

export const employeeKeys = {
  root: (businessId: string) => ["business-employees", businessId] as const,
  directory: (businessId: string, filters: service.EmployeeDirectoryFilters) =>
    [...employeeKeys.root(businessId), "directory", filters] as const,
  detail: (businessId: string, employeeId: string) =>
    [...employeeKeys.root(businessId), "detail", employeeId] as const,
};

export function useBusinessEmployeesQuery(
  businessId: string,
  filters: service.EmployeeDirectoryFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeKeys.directory(businessId, filters),
    queryFn: () => service.listBusinessEmployees(businessId, filters),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useBusinessEmployeeQuery(
  businessId: string,
  employeeId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeKeys.detail(businessId, employeeId),
    queryFn: () => service.getBusinessEmployee(businessId, employeeId),
    enabled: Boolean(businessId && employeeId) && enabled,
  });
}

export function useUpdateBusinessEmployeeMutation(
  businessId: string,
  employeeId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: service.UpdateBusinessEmployeeBody) =>
      service.updateBusinessEmployee(businessId, employeeId, body),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeKeys.detail(businessId, employeeId), employee);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.root(businessId) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
      ]);
    },
  });
}
