import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import type { AssignRoleResponse, UsersData } from "./types";
import toast from "react-hot-toast";
import { RiErrorWarningLine } from "react-icons/ri";


const USERS_QUERY = gql`
  query Users {
    users {
      id
      username
    }
  }
`;
const SET_ROLE = gql`
   mutation Assign_role($userId:Int!,$role:String!){
    assignRole(userId:$userId,role:$role){
      success
      message
    }
}
`
export default function Roles() {
  const { loading: loadingUsers, data: users, error, refetch } = useQuery<UsersData>(USERS_QUERY);
  const [assign_role] = useMutation(SET_ROLE);
  return <>
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Roles</h2>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const userId = formData.get("userId");
          const role = formData.get("role");
          if (userId == null || role === null) {
            toast.error("Please select both user and role.");
            return;
          }
          assign_role({ variables: { userId: parseInt(userId?.toString()), role } }).then((res) => {
            const data: AssignRoleResponse = res.data as AssignRoleResponse;
            const idToast = toast.loading("Assigning role...");
            if (data?.assignRole.success) {
              toast.success(data.assignRole.message, { id: idToast });
            } else {
              toast.error(data?.assignRole.message || "Failed to assign role.", { id: idToast });
            }
          }).catch((err) => {
            toast.error("Error assigning role: " + err.message);
          });
        }}>
          <div className="flex gap-2">
            <select name="userId" required className="select w-full max-w-xs" defaultValue={"default"}>
              <option disabled value={"default"}>Pick the user</option>
              {
                users && users.users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))
              }
            </select>
            {loadingUsers && <span className="loading loading-xs loading-spinner"></span>}
            {
              error && <RiErrorWarningLine onClick={refetch} className="text-red-600" />
            }
          </div>
          <select name="role" required className="select w-full max-w-xs" defaultValue={"default"}>
            <option disabled value={"default"}>Pick the role</option>
            <option value={"admin"}>Admin</option>
            <option value={"controller"}>Controller</option>
            <option value={"user"}>Simple user</option>
          </select>
          <button className="btn btn-sm btn-info">Assign Role</button>
        </form>
      </div>
    </div>
  </>
}