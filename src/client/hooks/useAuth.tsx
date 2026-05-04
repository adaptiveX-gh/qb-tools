import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAuthStatus, logout as apiLogout, connectToQuickBooks, AuthStatus } from "../services/auth";

interface AuthContextValue {
  connected: boolean;
  companyName: string | null;
  loading: boolean;
  connect: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>({ connected: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await getAuthStatus();
      setStatus(s);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async () => {
    await apiLogout();
    setStatus({ connected: false });
  };

  return (
    <AuthContext.Provider
      value={{
        connected: status.connected,
        companyName: status.companyName || null,
        loading,
        connect: connectToQuickBooks,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
