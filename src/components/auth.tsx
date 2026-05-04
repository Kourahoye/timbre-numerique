// src/auth/AuthContext.tsx
import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import type { ReactNode } from "react";
import { gql } from "@apollo/client";

type Me = {
  id: string;
  username: string;
  isActive: boolean;
};

type Perm = {
  id: string;
  name: string;
};

type AuthContextType = {
  me: Me | null;
  perms: Perm[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
};

const ME_WITH_PERMS_QUERY = gql`
  query MeWithPerms {
    me { id username isActive }
    perms { id name }
  }
`;

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, loading } = useQuery(ME_WITH_PERMS_QUERY, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-only",
  });

  const perms = data?.perms ?? [];

  useEffect(() => {
    if (data?.me?.username) {
      localStorage.setItem("me", data.me.username);
    }
  }, [data?.me?.username]);

  const hasPermission = (permission: string): boolean =>
    perms.some((p: Perm) => p.name.includes(permission));

  return (
    <AuthContext.Provider
      value={{ me: data?.me ?? null, perms, loading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};