import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { RiEyeLine, RiRefreshFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const NEW_NOTIFICATIONS = gql`
  query NEW_NOTIFICATIONS {
    notifications {
      title
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
      title
      content
      createdAt
      id
      link
      read
    }
  }
`;
const MARK_ONE_AS_READ = gql`
  mutation MARK_ONE_AS_READ($id: Int!) {
    markAsRead(id: $id) {
      message
      success
    }
  }
`;
const MARK_ALL_AS_READ = gql`
  mutation MARK_ONE_AS_READ {
    markAllAsRead {
      message
      success
    }
  }
`;
export type Notif = {
  content: string;
  createdAt: string;
  id: string;
  link: {
    id: number;
    link: string;
  };
  read: string;
  title: string;
};
export type Notifs = {
  notifications: Notif[];
};
export type AllNotifs = {
  allNotifications: Notif[];
};
export default function Notifications() {
  const { t } = useTranslation();
  const { loading, error, data, refetch } = useQuery<Notifs>(
    NEW_NOTIFICATIONS,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [
    loadAll,
    {
      loading: loadingAll,
      error: errorAll,
      data: dataAll,
      refetch: refecthAll,
      called,
    },
  ] = useLazyQuery<AllNotifs>(NOTIFICATIONS);
  const [markasread,{loading:marking}] = useMutation<{
    markAsRead: { message: string; success: boolean };
  }>(MARK_ONE_AS_READ);
  const [markallasread,{loading:markingAll}] = useMutation<{
    markAllAsRead: { message: string; success: boolean };
  }>(MARK_ALL_AS_READ);

  return (
    <>
      <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-base-200 max-w-6xl mx-auto mt-5">
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
            <li className="p-4 pb-2 text-lg tracking-wide text-error flex justify-between">
              <span>{t("notifications.title")}</span>
              {data && data.notifications.length != 0 && (
                <button
                  className="btn btn-xs btn-outline btn-info btn-ghost"
                  onClick={() => {
                    markallasread().then(()=>{
                      if (called){
                        refecthAll();
                        return
                      } 
                      refetch()
                    });
                  }}
                >
                  <span>
                    {t("notifications.markall")}
                  </span>
                  {
                    markingAll && <span className="loading loading-spinner loading-xs"></span>
                  }
                </button>
              )}
            </li>
            {!dataAll &&
              data.notifications.map((notif) => {
                return (
                  <li
                    key={notif.id}
                    className={`rounded-lg border p-4 transition ${notif.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}${notif.read ? "dark:bg-slate-800 dark:border-gray-900" : "dark:bg-blue-900 dark:border-blue-950"}`}
                  >
                    <div className="flex justify-between space-x-2 space-y-2 items-start mb-1">
                      <h3 className="font-medium text-gray-900">
                        {notif.title || "Titre non défini"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {notif.content}
                      {notif.link && notif.link.link && (
                        <a
                          href={notif.link.link}
                          target="_blank"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {notif.link.link}
                        </a>
                      )}
                    </p>
                    <div className="mt-3  flex justify-between items-end">
                      {!notif.read && (
                        <form
                          method="post"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const toastId = toast.loading("Please wait..");
                            markasread({
                              variables: { id: Number.parseInt(notif.id) },
                            })
                              .then((res) => {
                                if (res.data) {
                                  if (res.data.markAsRead.success == true) {
                                    toast.success(res.data.markAsRead.message, {
                                      id: toastId,
                                    });
                                  } else {
                                    toast.error(res.data.markAsRead.message, {
                                      id: toastId,
                                    });
                                    return;
                                  }
                                }
                                if (res.error) {
                                  toast.error(res.error.message, {
                                    id: toastId,
                                  });
                                }
                                refetch();
                              })
                              .catch((error) => {
                                toast.error(error.message, { id: toastId });
                              });
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-blue-600 hover:underline"
                          >
                              <span>
                              {t("notifications.markAsRead")}
                            </span>
                              {
                    marking && <span className="loading loading-spinner loading-xs"></span>
                  }
                          </button>
                        </form>
                      )}
                      {notif.link && notif.link.id && (
                        <Link
                          to={`/transaction/${notif.link.id}`}
                          type="button"
                          onClick={() =>
                            markasread({
                              variables: { id: Number.parseInt(notif.id) },
                            }).then(() => {
                              refetch();
                            })
                          }
                          className="btn btn-sm btn-outline btn-info btn-ghost items-center"
                        >
                          <span>{t("common.see")}</span>{" "}
                          <RiEyeLine className="inline" />
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            {called &&
              dataAll &&
              dataAll.allNotifications.map((notif) => {
                return (
                  <li
                    className={`rounded-lg border p-4 transition ${notif.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"}${notif.read ? "dark:bg-slate-800 dark:border-gray-900" : "dark:bg-blue-900 dark:border-blue-950"}`}
                  >
                    <div className="flex justify-between space-x-2 space-y-2 items-start mb-1">
                      <h3 className="font-medium text-gray-900">
                        {notif.title || "Titre non défini"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {notif.content}
                      {notif.link && notif.link.link && (
                        <a
                          href={notif.link.link}
                          target="_blank"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {notif.link.link}
                        </a>
                      )}
                    </p>
                    <div className="mt-3 flex justify-between items-end">
                      {!notif.read && (
                        <form
                          method="post"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const toastId = toast.loading("Please wait..");
                            markasread({
                              variables: { id: Number.parseInt(notif.id) },
                            })
                              .then((res) => {
                                if (res.data) {
                                  if (res.data.markAsRead.success == true) {
                                    toast.success(res.data.markAsRead.message, {
                                      id: toastId,
                                    });
                                  } else {
                                    toast.error(res.data.markAsRead.message, {
                                      id: toastId,
                                    });
                                    return;
                                  }
                                }
                                if (res.error) {
                                  toast.error(res.error.message, {
                                    id: toastId,
                                  });
                                }
                                refetch();
                              })
                              .catch((error) => {
                                toast.error(error.message, { id: toastId });
                              });
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-blue-600 hover:underline"
                          >
                              <span>
                              {t("notifications.markAsRead")}
                            </span>
                              {
                    marking && <span className="loading loading-spinner loading-xs"></span>
                  }
                          </button>
                        </form>
                      )}
                      {notif.link && notif.link.id && (
                        <Link
                          to={`/transaction/${notif.link.id}`}
                          type="button"
                          onClick={() =>
                            markasread({
                              variables: { id: Number.parseInt(notif.id) },
                            }).then(() => {
                              refetch();
                            })
                          }
                          className="btn btn-sm btn-outline btn-info btn-ghost items-center"
                        >
                          <span>{t("common.see")}</span>{" "}
                          <RiEyeLine className="inline" />{" "}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            {!called && (
              <li className="text-xs">
                {" "}
                <button onClick={() => loadAll()} className="link link-info">
                  {" "}
                  {t("notifications.showAll")}
                </button>
                {loadingAll && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
}
