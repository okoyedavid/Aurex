"use client";

import { createContext, useContext } from "react";

import type { BusinessAccessResponse } from "@/lib/business-api";
import type { Permission } from "@/types/generic";

type ActiveBusinessAccess = BusinessAccessResponse & {
  membership: NonNullable<BusinessAccessResponse["membership"]>;
};

type BusinessAccessContextValue = ActiveBusinessAccess & {
  effectivePermissions: ReadonlySet<Permission>;
};

const BusinessAccessContext = createContext<BusinessAccessContextValue | null>(null);

export function BusinessAccessContextProvider({
  value,
  children,
}: {
  value: BusinessAccessContextValue;
  children: React.ReactNode;
}) {
  return <BusinessAccessContext.Provider value={value}>{children}</BusinessAccessContext.Provider>;
}

export function useBusinessAccess() {
  const context = useContext(BusinessAccessContext);
  if (!context) throw new Error("useBusinessAccess must be used inside the business layout.");
  return context;
}
