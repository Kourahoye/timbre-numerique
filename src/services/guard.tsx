import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/auth";

type Props = {
  children: ReactNode;
  permission?: string;
};

const ProtectedRoute = ({ children, permission }: Props) => {
  const { me, loading, hasPermission } = useAuth();

  if (loading) return <div className="h-max flex items-center justify-center"><div className="loading loading-spinner loading-xl"> </div> </div>;
  if (!me) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;