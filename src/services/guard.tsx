import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/auth";

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

// const ME_AUTH_QUERY = gql`
//   query Me {
//     me {
//       id
//       username
//       isActive
//     }
//     perms {
//       id
//       name
//     }
//   }
// `;

// const ProtectedRoute = ({ children, permission }: Props) => {
//   const { data, loading, error } = useQuery<MeData>(ME_AUTH_QUERY);

//   if (loading) return <p>Loading...</p>;

//   // ❌ pas connecté ou erreur
//   if (error || !data?.me) {
//     localStorage.removeItem("me")
//     return <Navigate to="/login" replace />;
//   }
//   if (data){
//     localStorage.setItem("me",data.me.username)
//   }
//   if(permission==null || permission == "") return <>{children}</>;
//   const userPermissions = data.perms ?? [];

//   // console.log("User permissions:", userPermissions,permission);

//   // ✅ check permission propre
//   // if (
//   //   permission &&
//   //   !userPermissions.some((perm) => perm.name === permission)
//   // ) {
//   //   return <Navigate to="/unauthorized" replace />;
//   // }

//   return <>{children}</>;
// };

// const ME_QUERY = gql`
// query Me {
//   me { id username isActive }
//   }
// `;

// const ME_WITH_PERMS_QUERY = gql`
//   query MeWithPerms {
//     me { id username isActive }
//     perms { id name }
//   }
// `;

const ProtectedRoute = ({ children, permission }: Props) => {
  const { me, loading, hasPermission } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!me) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;