"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Bank } from "@/features/business/bank-account-service";
import type { EmployeeDraft } from "@/features/business/business-draft-types";
import { useResolveBankAccountQuery } from "@/features/business/business-hooks";
import { useDebouncedValue } from "@/features/business/use-debounced-value";

export function EmployeeDraftRow({
  employee,
  banks,
  banksLoading,
  banksError,
  disabled,
  onUpdate,
  onRemove,
}: {
  employee: EmployeeDraft;
  banks: Bank[];
  banksLoading: boolean;
  banksError?: string;
  disabled: boolean;
  onUpdate: (patch: Partial<EmployeeDraft>) => void;
  onRemove: () => void;
}) {
  const [bankSearch, setBankSearch] = useState(employee.bankName ?? "");
  const debouncedBankSearch = useDebouncedValue(bankSearch, 300);
  const debouncedAccountNumber = useDebouncedValue(
    employee.accountNumber ?? "",
    300,
  );
  const resolveQuery = useResolveBankAccountQuery({
    bankCode: employee.bankCode ?? "",
    accountNumber: debouncedAccountNumber,
  });

  useEffect(() => {
    if (!resolveQuery.data) return;

    if (
      employee.accountName === resolveQuery.data.accountName &&
      employee.accountVerified
    ) {
      return;
    }

    onUpdate({
      accountName: resolveQuery.data.accountName,
      accountVerified: true,
      accountVerifiedAt: new Date().toISOString(),
    });
  }, [
    employee.accountName,
    employee.accountNumber,
    employee.accountVerified,
    onUpdate,
    resolveQuery.data,
  ]);

  const filteredBanks = useMemo(() => {
    const search = debouncedBankSearch.trim().toLowerCase();

    if (!search) {
      return banks.slice(0, 8);
    }

    return banks
      .filter((bank) => {
        const haystack = `${bank.name} ${bank.code} ${bank.slug}`.toLowerCase();
        return haystack.includes(search);
      })
      .slice(0, 8);
  }, [banks, debouncedBankSearch]);

  const accountResolveReady =
    Boolean(employee.bankCode) && debouncedAccountNumber.length === 10;
  const isResolved = Boolean(employee.accountName && employee.accountVerified);

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          Full name
          <Input
            value={employee.fullName}
            disabled={disabled}
            onChange={(event) => onUpdate({ fullName: event.target.value })}
            className="mt-2 h-10 rounded-md"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Job title
          <Input
            value={employee.jobTitle ?? ""}
            disabled={disabled}
            onChange={(event) => onUpdate({ jobTitle: event.target.value })}
            className="mt-2 h-10 rounded-md"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Amount
          <Input
            type="number"
            min="0"
            value={employee.amount ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onUpdate({
                amount: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            className="mt-2 h-10 rounded-md"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground">
            Currency
            <select
              value={employee.currency ?? "NGN"}
              disabled={disabled}
              onChange={(event) => onUpdate({ currency: event.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <label className="text-sm font-medium text-foreground">
            Pay frequency
            <select
              value={employee.payFrequency ?? "monthly"}
              disabled={disabled}
              onChange={(event) =>
                onUpdate({
                  payFrequency: event.target
                    .value as EmployeeDraft["payFrequency"],
                })
              }
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="one_time">One time</option>
            </select>
          </label>
        </div>
        <div className="text-sm font-medium text-foreground">
          <label htmlFor={`bank-${employee.tempId}`}>Bank</label>
          <Input
            id={`bank-${employee.tempId}`}
            value={bankSearch}
            disabled={disabled || banksLoading}
            onChange={(event) => {
              setBankSearch(event.target.value);
              onUpdate({
                bankCode: "",
                bankName: "",
                accountName: "",
                accountVerified: false,
                accountVerifiedAt: undefined,
              });
            }}
            className="mt-2 h-10 rounded-md"
            placeholder={
              banksLoading ? "Loading banks..." : "Search bank name or code"
            }
          />
          {banksError ? (
            <p className="mt-2 text-xs text-destructive">{banksError}</p>
          ) : null}
          {employee.bankName ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Bank: {employee.bankName}
            </p>
          ) : null}
          {!disabled && bankSearch.trim() && !employee.bankCode ? (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-sm">
              {filteredBanks.length > 0 ? (
                filteredBanks.map((bank) => (
                  <button
                    key={`${bank.code}-${bank.slug}`}
                    type="button"
                    className="block w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => {
                      setBankSearch(bank.name);
                      onUpdate({
                        bankName: bank.name,
                        bankCode: bank.code,
                        accountName: "",
                        accountVerified: false,
                        accountVerifiedAt: undefined,
                      });
                    }}
                  >
                    <span className="font-medium">{bank.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {bank.code}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-2 text-xs text-muted-foreground">
                  No banks found.
                </p>
              )}
            </div>
          ) : null}
        </div>
        <label className="text-sm font-medium text-foreground">
          Account number
          <Input
            inputMode="numeric"
            maxLength={10}
            value={employee.accountNumber ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onUpdate({
                accountNumber: event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10),
                accountName: "",
                accountVerified: false,
                accountVerifiedAt: undefined,
              })
            }
            className="mt-2 h-10 rounded-md"
          />
          <span className="mt-2 block text-xs text-muted-foreground">
            {employee.bankName
              ? `Bank: ${employee.bankName}`
              : "Select a bank first."}
          </span>
          {resolveQuery.isFetching && accountResolveReady ? (
            <span className="mt-1 block text-xs text-muted-foreground">
              Resolving account...
            </span>
          ) : null}
          {resolveQuery.isError && accountResolveReady ? (
            <span className="mt-1 block text-xs text-destructive">
              {resolveQuery.error instanceof Error
                ? resolveQuery.error.message
                : "Unable to resolve account."}
            </span>
          ) : null}
          {employee.accountName ? (
            <span className="mt-1 flex items-center gap-1 text-xs text-primary">
              {isResolved ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              Account name: {employee.accountName}
            </span>
          ) : null}
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
          Remove employee
        </Button>
      </div>
    </div>
  );
}
