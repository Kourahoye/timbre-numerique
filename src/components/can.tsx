import type { ReactNode } from "react";
import { useAuth } from "./auth";


type Props = {
  permission: string;
  fallback?: ReactNode;  // ✅ undefined, null, string, JSX...
  children: ReactNode;
};
// src/auth/Can.tsx
export const Can = ({ permission, fallback = null, children }: Props) => {
  const { perms } = useAuth();

  // ✅ logique stricte pour les boutons — pas de permission = rien afficher
  if (permission == "") return <>{children}</>
  if (!permission) return null;
  const allowed = perms.some((p) => p.name.includes(permission));
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
};