import { useAuth } from "./auth";

// src/auth/Can.tsx
export const Can = ({ permission, fallback = null, children }: Props) => {
  const { perms } = useAuth();

  // ✅ logique stricte pour les boutons — pas de permission = rien afficher
  if (!permission) return null;
  
  const allowed = perms.some((p) => p.name.includes(permission));
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
};