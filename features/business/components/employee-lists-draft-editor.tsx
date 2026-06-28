"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeDraftRow } from "@/features/business/components/employee-draft-row";
import {
  newEmployee,
  newEmployeeList,
} from "@/features/business/business-draft-factory";
import type {
  EmployeeDraft,
  EmployeeListDraft,
} from "@/features/business/business-draft-types";
import { usePaystackBanksQuery } from "@/features/business/business-hooks";
import {
  MAX_EMPLOYEES_PER_LIST,
  MAX_LISTS_PER_BUSINESS,
} from "@/features/business/employee-list-form";

export function EmployeeListsDraftEditor({
  employeeLists,
  setEmployeeLists,
  disabled,
  maxLists = MAX_LISTS_PER_BUSINESS,
}: {
  employeeLists: EmployeeListDraft[];
  setEmployeeLists: Dispatch<SetStateAction<EmployeeListDraft[]>>;
  disabled: boolean;
  maxLists?: number;
}) {
  const banksQuery = usePaystackBanksQuery();

  function updateList(
    listId: string,
    updater: (list: EmployeeListDraft) => EmployeeListDraft,
  ) {
    setEmployeeLists((current) =>
      current.map((list) => (list.tempId === listId ? updater(list) : list)),
    );
  }

  function updateEmployee(
    listId: string,
    employeeId: string,
    patch: Partial<EmployeeDraft>,
  ) {
    updateList(listId, (list) => ({
      ...list,
      employees: list.employees.map((employee) =>
        employee.tempId === employeeId ? { ...employee, ...patch } : employee,
      ),
    }));
  }

  return (
    <div className="grid gap-4">
      {employeeLists.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-5 text-center">
          <p className="font-semibold text-foreground">
            No employee lists added
          </p>
          <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
            Add a list for departments or payroll groups. Employees are
            optional.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={disabled || employeeLists.length >= maxLists}
            onClick={() => setEmployeeLists([newEmployeeList()])}
          >
            <Plus className="h-4 w-4" />
            Add list
          </Button>
        </div>
      ) : (
        <>
          <div
            className={
              employeeLists.length >= maxLists ? "hidden" : "flex justify-end"
            }
          >
            <Button
              type="button"
              variant="outline"
              disabled={disabled || employeeLists.length >= maxLists}
              onClick={() =>
                setEmployeeLists((current) => [...current, newEmployeeList()])
              }
            >
              <Plus className="h-4 w-4" />
              Add list
            </Button>
          </div>
          {employeeLists.map((list, listIndex) => (
            <div
              key={list.tempId}
              className="rounded-md border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  Employee list
                  <Input
                    value={list.name}
                    disabled={disabled}
                    onChange={(event) =>
                      updateList(list.tempId, (current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 rounded-md bg-background"
                    placeholder={listIndex === 0 ? "Technical" : "Operations"}
                  />
                </label>
                <label className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  Description
                  <Input
                    value={list.description ?? ""}
                    disabled={disabled}
                    onChange={(event) =>
                      updateList(list.tempId, (current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 rounded-md bg-background"
                    placeholder="Payroll group"
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() =>
                    setEmployeeLists((current) =>
                      current.filter((item) => item.tempId !== list.tempId),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Remove list
                </Button>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Currency
                    <select
                      className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                      value={list.currency ?? "NGN"}
                      disabled={disabled}
                      onChange={(event) =>
                        updateList(list.tempId, (current) => ({
                          ...current,
                          currency: event.target.value,
                        }))
                      }
                    >
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Pay frequency
                    <select
                      className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                      value={list.payFrequency ?? "monthly"}
                      disabled={disabled}
                      onChange={(event) =>
                        updateList(list.tempId, (current) => ({
                          ...current,
                          payFrequency: event.target
                            .value as EmployeeListDraft["payFrequency"],
                        }))
                      }
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="one_time">One time</option>
                    </select>
                  </label>
                </div>
                {list.employees.map((employee) => (
                  <EmployeeDraftRow
                    key={employee.tempId}
                    employee={employee}
                    banks={banksQuery.data ?? []}
                    banksError={
                      banksQuery.isError
                        ? banksQuery.error instanceof Error
                          ? banksQuery.error.message
                          : "Unable to load banks."
                        : undefined
                    }
                    banksLoading={banksQuery.isLoading}
                    disabled={disabled}
                    onUpdate={(patch) =>
                      updateEmployee(list.tempId, employee.tempId, patch)
                    }
                    onRemove={() =>
                      updateList(list.tempId, (current) => ({
                        ...current,
                        employees: current.employees.filter(
                          (item) => item.tempId !== employee.tempId,
                        ),
                      }))
                    }
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-3"
                disabled={
                  disabled || list.employees.length >= MAX_EMPLOYEES_PER_LIST
                }
                onClick={() =>
                  updateList(list.tempId, (current) => ({
                    ...current,
                    employees: [...current.employees, newEmployee()],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
                Add employee
              </Button>
              <span className="ml-3 text-xs text-muted-foreground">
                {list.employees.length}/{MAX_EMPLOYEES_PER_LIST} employees
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
