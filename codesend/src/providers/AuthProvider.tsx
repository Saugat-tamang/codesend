"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { authService } from "@/services/auth.service";
import type {
  AuthContextValue,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const { user } = await authService.me();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refetch().finally(() => setIsLoading(false));
  }, [refetch]);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user } = await authService.login(payload);
    setUser(user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user } = await authService.register(payload);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}
