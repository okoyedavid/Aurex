"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AuthHandoff = {
  email: string;
  password?: string;
};

type AuthHandoffContextValue = {
  handoff: AuthHandoff | null;
  stage: (details: AuthHandoff) => void;
  clear: () => void;
};

const AuthHandoffContext = createContext<AuthHandoffContextValue | null>(null);

export function AuthHandoffProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [handoff, setHandoff] = useState<AuthHandoff | null>(null);
  const stage = useCallback((details: AuthHandoff) => {
    setHandoff({
      email: details.email.trim().toLowerCase(),
      ...(details.password ? { password: details.password } : {}),
    });
  }, []);
  const clear = useCallback(() => setHandoff(null), []);
  const value = useMemo(
    () => ({ handoff, stage, clear }),
    [clear, handoff, stage],
  );

  return (
    <AuthHandoffContext.Provider value={value}>
      {children}
    </AuthHandoffContext.Provider>
  );
}

export function useAuthHandoff() {
  const context = useContext(AuthHandoffContext);

  if (!context) {
    throw new Error("useAuthHandoff must be used inside AuthHandoffProvider.");
  }

  return context;
}
