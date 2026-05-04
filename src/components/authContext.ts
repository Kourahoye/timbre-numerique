// src/auth/AuthContext.ts  ← pas de .tsx, pas de JSX
import { createContext, useContext } from "react";

type Me = { id: string; username: string; isActive: boolean; };
type Perm = { id: string; name: string; };

export type AuthContextType = {
  me: Me | null;
  perms: Perm[];
  loading: boolean;
  hasPermission: (permission: string | undefined) => boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};