import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Me = {
  id: string;
  username:string;
  permissions?: string[];
};

type Perms = {
  id: string;
  name: string;
};

type MeData = {
  me: Me | null;
  perms: Perms[] | null;
};

type Props = {
  children: ReactNode;
  permission?: string;
};

const ME_AUTH_QUERY = gql`
  query Me {
    me {
      id
      username
      isActive
    }
    perms {
      id
      name
    }
  }
`;

const ProtectedRoute = ({ children, permission }: Props) => {
  const { data, loading, error } = useQuery<MeData>(ME_AUTH_QUERY);

  if (loading) return <p>Loading...</p>;

  // ❌ pas connecté ou erreur
  if (error || !data?.me) {
    localStorage.removeItem("me")
    return <Navigate to="/login" replace />;
  }
  if (data){
    localStorage.setItem("me",data.me.username)
  }
  if(permission==null || permission == "") return <>{children}</>;
  const userPermissions = data.perms ?? [];

  // console.log("User permissions:", userPermissions,permission);

  // ✅ check permission propre
  // if (
  //   permission &&
  //   !userPermissions.some((perm) => perm.name === permission)
  // ) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;