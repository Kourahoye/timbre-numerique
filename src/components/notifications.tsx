import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import {  RiEyeLine, RiRefreshFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const NEW_NOTIFICATIONS = gql`
  query NEW_NOTIFICATIONS {
    notifications {
      content
      createdAt
      id
      link
      read
    }
  }
`;
const NOTIFICATIONS = gql`
  query NOTIFICATIONS {
    allNotifications {
    content
    createdAt
    id
    link
    read
  }
  }
`;
const MARK_ONE_AS_READ = gql`
mutation MARK_ONE_AS_READ($id:Int!) {
  markAsRead(id: $id) {
    message
    success
  }
}
`
export type Notifs = {
  notifications: {
    content: string;
    createdAt: string;
    id: string;
    link: {
        id:number
    };
    read: string;
    title:string;
  }[];
};
export type AllNotifs = {
  allNotifications: {
    content: string;
    createdAt: string;
    id: string;
    link: {
        id:number
    };
    read: string;
    title:string;
  }[];
};
export default function Notifications() {
  const { loading, error, data, refetch } = useQuery<Notifs>(NEW_NOTIFICATIONS);
  const [ loadAll,{ loading:loadingAll, error:errorAll, data:dataAll, refetch:refecthAll,called }] = useLazyQuery<AllNotifs>(NOTIFICATIONS);
   const [markasread] = useMutation<{markAsRead:{message:string,success:boolean}}>(MARK_ONE_AS_READ);

  return (
    <>
      <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-base-200 max-w-3xl mx-auto mt-5">
        {loading && (
          <span className="loading loading-spinner loading-lg"></span>
        )}
        {error && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error.message}</span>
            <RiRefreshFill onClick={refetch} className="btn btn-sm" />
          </div>
        )}
        {called && errorAll && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorAll.message}</span>
            <RiRefreshFill onClick={refecthAll} className="btn btn-sm" />
          </div>
        )}
        {data && (
          <ul className="space-y-4 w-full card shadow bg-base-200 p-4">
            <li className="p-4 pb-2 text-lg tracking-wide text-error">
              Notifications non lues
            </li>
            {!dataAll  && data.notifications.map((notif) => {
              return (
                <li key={notif.id} className={`rounded-lg border p-4 transition ${ notif.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}${ notif.read ? "dark:bg-slate-800 dark:border-gray-900" : "dark:bg-blue-900 dark:border-blue-950"}`}>
                <div className="flex justify-between space-x-2 space-y-2 items-start mb-1">
                    <h3 className="font-medium text-gray-900">
                                 {notif.content}
                             </h3>
                              <span className="text-xs text-gray-500">
                                 {new Date(notif.createdAt).toLocaleDateString()}
                             </span>
                        </div>
                        <p className="text-sm text-gray-700">
                             { notif.content }
                        </p>
                        <div  className="mt-3  flex justify-between items-end">
                        {   !notif.read &&
                            <form method="post"                               
                               onSubmit={(e)=>{
                                    e.preventDefault()
                                    const toastId= toast.loading("Please wait..")
                                    markasread({variables:{id:Number.parseInt(notif.id)}}).then((res)=>{
                                        if(res.data){
                                            if(res.data.markAsRead.success == true){
                                                toast.success(res.data.markAsRead.message,{id:toastId})
                                            }else{
                                                toast.error(res.data.markAsRead.message,{id:toastId})
                                                return
                                            }
                                        }
                                        if(res.error){
                                            toast.error(res.error.message,{id:toastId})
                                        }
                                        refetch()
                                    }).catch((error)=>{
                                        toast.error(error.message,{id:toastId})
                                    })
                                }}
                                >
                            <button type="submit"
                            className="text-xs text-blue-600 hover:underline">
                                Marquer comme lu
                            </button>
                            
                            </form>
                            }
                            {
                                notif.link && <Link to={`/transaction/${notif.link.id}`} type="button" onClick={()=>markasread({variables:{id:Number.parseInt(notif.id)}}).then(()=>{refetch()})} className="btn btn-sm btn-outline btn-info btn-ghost items-center"><span>Voir</span> <RiEyeLine className="inline" />  </Link>
                            }
                            </div>
                </li>
              );
            })}
            {called && dataAll && dataAll.allNotifications.map((notif) => {
              return (
                <li className={`rounded-lg border p-4 transition ${ notif.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}${ notif.read ? "dark:bg-slate-800 dark:border-gray-900" : "dark:bg-blue-900 dark:border-blue-950"}`}>
                <div className="flex justify-between space-x-2 space-y-2 items-start mb-1">
                    <h3 className="font-medium text-gray-900">
                                 {notif.content}
                             </h3>
                              <span className="text-xs text-gray-500">
                                 {new Date(notif.createdAt).toLocaleDateString()}
                             </span>
                        </div>
                        <p className="text-sm text-gray-700">
                             { notif.content }
                        </p>
                        <div className="mt-3 flex justify-between items-end">

                        {   !notif.read &&
                            <form method="post"                      
                                onSubmit={(e)=>{
                                    e.preventDefault()
                                    const toastId= toast.loading("Please wait..")
                                    markasread({variables:{id:Number.parseInt(notif.id)}}).then((res)=>{
                                        if(res.data){
                                            if(res.data.markAsRead.success == true){
                                                toast.success(res.data.markAsRead.message,{id:toastId})
                                            }else{
                                                toast.error(res.data.markAsRead.message,{id:toastId})
                                                return
                                            }
                                        }
                                        if(res.error){
                                            toast.error(res.error.message,{id:toastId})
                                        }
                                        refetch()
                                    }).catch((error)=>{
                                        toast.error(error.message,{id:toastId})
                                    })
                                }}
                                >
                            <button type="submit"
                            className="text-xs text-blue-600 hover:underline">
                                Marquer comme lu
                            </button>
                           
                            </form>
                        }
                        {
                            notif.link && <Link to={`/transaction/${notif.link.id}`} type="button" onClick={()=>markasread({variables:{id:Number.parseInt(notif.id)}}).then(()=>{refetch()})} className="btn btn-sm btn-outline btn-info btn-ghost items-center"><span>Voir</span> <RiEyeLine className="inline" />  </Link>
                        }
                        </div>
                </li>
              );
            })}
            {
                ! called && <li className="text-xs"> <button onClick={()=>loadAll()} className="link link-info" >Afficher toutes les notifications</button>
                    {
                        loadingAll && <span className="loading loading-spinner loading-sm"></span>
                    }
                 </li>
            }

          </ul>
        )}
      </div>
    </>
  );
}
