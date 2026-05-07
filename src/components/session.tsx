import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import type {
  AddSession,
  DeleteSessionMutationResponse,
  Sessions,
  ToggleSessionMutationResponse,
} from "./types";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { RiAddLine, RiDeleteBin6Line, RiEditLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const ADD_SESSION = gql`
  mutation ADD_SESSION($name: String!, $start: Date!, $end: Date!) {
    addSession(name: $name, start: $start, end: $end) {
      id
      name
    }
  }
`;
const ALL_SESSIONS = gql`
  query All_SESSIONS {
    sessionInfos {
      createdAt
      createdBy {
        username
      }
      endDate
      id
      name
      active
      startDate
      updatedAt
      updatedBy {
        username
      }
    }
  }
`;
const DELETE_SESSION = gql`
  mutation DELETE_SESSION($id: Int!) {
    deleteSession(id: $id) {
      message
      success
    }
  }
`;
const TOOGLE_ACTIVE_SESSION = gql`
  mutation TOOGLE_ACTIVE_SESSION($id: Int!) {
    toogleActiveSession(id: $id) {
      message
      success
    }
  }
`;
const CHANGE_SESSION_NAME = gql`
mutation CHANGE_SESSION_NAME($id:Int!,$name:String!) {
  changeSessionName(id: $id, name: $name) {
    id
    name
  }
}
`;
const CHANGE_SESSION_DATE = gql`
mutation CHANGE_SESSION_DATE($id:Int!,$start:Date!,$end:Date!) {
  changeSessionDate(end: $end, id: $id, start: $start) {
    id
    name
  }
}
`;
export default function Session() {
  const {t} = useTranslation();
  const [addsession, { loading: adding }] = useMutation(ADD_SESSION);
  const [error, setError] = useState("");
  const [loadSessions, { called, loading, data, refetch }] =useLazyQuery<Sessions>(ALL_SESSIONS);
  const [deleteSession] = useMutation(DELETE_SESSION);
  const [toogleSession] = useMutation(TOOGLE_ACTIVE_SESSION);
  const [changeName,{loading:changingName}] = useMutation(CHANGE_SESSION_NAME);
  const [changeDates,{loading:changingDates}] = useMutation(CHANGE_SESSION_DATE);

  const [currId,setCurrId]=useState<number|null>()
  useEffect(() => {
    loadSessions();
  }, []);

  const toogle = (id: number, active: boolean) => {
    Swal.fire({
      title: `${t("confirm.areYouSure")}`,
      html: `${active ? t("session.toggleActivate") : t("session.toggleDeactivate")}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${active ? t("common.yesInactive") : t("common.yesActive")}`,
    }).then(async (result) => {
      if (!result.isConfirmed) {
        // e.preventDefault()
        return;
      }
      const toastId = toast.loading(`${t("common.pleaseWait")}`);
      toogleSession({ variables: { id: id } })
        .then((res) => {
          const data: ToggleSessionMutationResponse =
            res.data as ToggleSessionMutationResponse;
          if (data.toogleActiveSession.success) {
            toast.success(data.toogleActiveSession.message, { id: toastId });
          } else {
            toast.error(data.toogleActiveSession.message, { id: toastId });
          }
          // toast.success(data.message, { id:toastId })
          refetch();
        })
        .catch(() => {
          toast.error(`${t("common.unexpectedError")}`, { id: toastId });
        });
    });
  };

  const sessionDelete = (id: number) => {
    Swal.fire({
      title: `${t("confirm.areYouSure")}`,
      text: `${t("confirm.cannotRevert")}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText:`${t("confirm.yesDelete")}`,
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const toastId = toast.loading(`${t("common.pleaseWait")}`);
      deleteSession({ variables: { id: id } })
        .then((res) => {
          // toast.success("Type de timbre supprimé avec succès !");
          // console.log(data)
          const data: DeleteSessionMutationResponse =
            res.data as DeleteSessionMutationResponse;
          if (data.deleteSession.success) {
            toast.success(data.deleteSession.message, { id: toastId });
          } else {
            toast.error(data.deleteSession.message, { id: toastId });
          }
          // toast.success(data.message, { id:toastId })
          refetch();
        })
        .catch(() => {
          toast.error(`${t("common.unexpectedError")}`, { id: toastId });
        });
    });
  };

  return (
    <>
      <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-base-200 w-full">
        <dialog id="add_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-center mb-4">
                {t("session.createSession")}
              </h1>
              <form
                method="post"
                className="space-y-3 flex flex-col items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get("name") || null;
                  const start = formData.get("date_start") || null;
                  const end = formData.get("date_end") || null;
                  setError("");
                  if (start == null || end == null || name == null) {
                    toast.error("Error: Viellez remplir les champs");
                    return;
                  }
                  if (start >= end) {
                    setError(`${t("session.startBeforeEnd")}`);
                    return;
                  }
                  const toastId = toast.loading(`${t("common.pleaseWait")}`);
                  addsession({
                    variables: { name: name, start: start, end: end },
                  })
                    .then((res) => {
                      const data = res.data as AddSession;
                      // console.log(data)
                      // if (data == null){
                      // }
                      if (data.addSession.id) {
                        toast.success(`${t("session.addSuccess",{name:data.addSession.name})}`, {
                          id: toastId,
                        });
                      }
                      refetch();
                    })
                    .catch((err) => {
                      if (
                        err.message.includes(
                          "UNIQUE constraint failed: timbre_session.name",
                        )
                      ) {
                        toast.error(`${t("session.duplicateName")}`, {
                          id: toastId,
                        });
                        return;
                      }
                      toast.error(err.message, { id: toastId });
                      // toast.error(err,{id:toastId})
                    });
                }}
              >
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text"> <th>{t("session.name")}</th></span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t("common.typeHere")}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">{t("session.startDate")}</span>
                  </label>
                  <input
                    type="date"
                    placeholder={t("common.typeHere")}
                    required
                    name="date_start"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">{t("session.endDate")}</span>
                  </label>
                  <input
                    type="date"
                    placeholder={t("common.typeHere")}
                    required
                    name="date_end"
                    className="input input-bordered w-full"
                  />
                </div>
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
                    <span>{error}</span>
                  </div>
                )}
                <button className="btn btn-sm btn-outline btn-info btn-ghost">
                  <span>{t("common.save")}</span>
                  {adding && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </dialog>
        <dialog id="update_session" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t("session.modification")}</h3>
            <div className="py-4">
              <form method="post" className="space-x-2 space-y-2 flex justify-between" onSubmit={(e)=>{
                e.preventDefault()
                if(!currId){
                  toast.error(`${t("session.selectSetion")}`)
                  return
                }
                const form = new FormData(e.currentTarget)
                const name = form.get("new_name") 
                if (name == "" || name == null){
                  toast.error(`${t("session.newName")}`)
                }
                const toastId = toast.loading(`${t("common.pleaseWait")}`)
                changeName({variables:{id:currId,name:name}}).then((res)=>{
                  if(res.data){
                    toast.success("Changement effectuer",{id:toastId})
                    refetch()
                    return
                  }
                  if(res.error){
                    toast.error(res.error.message,{id:toastId})
                  }
                }).catch((error)=>{
                  if(error.message){
                    toast.error(error.message,{id:toastId})
                  }
                })
              }}>
                <input type="text" placeholder="new name" required name="new_name" className="input input-sm w-full" />
                <button className='btn btn-sm btn-outline btn-ghost btn-info'><span>{t("common.change")}</span>
                {
                  changingName && <span className="loading loading-spinner loading-xs"></span>
                }
                </button>
              </form>
              <div className="divider">Default</div>
                <form  method="post" className="space-y-2" onSubmit={(e)=>{
                  e.preventDefault()
                  const form = new FormData(e.currentTarget)
                  const start =  form.get("new_start")
                  const end =  form.get("new_end")
                  if (start == null || start == "" || end==null || end==""){
                    toast.error(`${t("session.fillFields")}`)
                    return;
                  }if(start > end){
                    toast.error(`${t("session.startBeforeEnd")}`)
                    return;
                  }
                  const toastId = toast.loading(`${t("common.pleaseWait")}`)
                    changeDates({variables:{id:currId,start:start,end:end}}).then((res)=>{
                      if(res.data){
                        toast.success(`${t("session.changeSuccess")}`,{id:toastId})
                        refetch()
                        return
                      }
                      if(res.error){
                        toast.error(res.error.message,{id:toastId})
                      }
                    }).catch((error)=>{
                      if(error.message){
                        toast.error(error.message,{id:toastId})
                      }
                    })
                }}>
                  <div className="form-control w-full ">
                    <label className="label">
                      <span className="label-text">{t("session.startDate")}</span>
                    </label>
                    <input type="date" placeholder={t("common.typeHere")} name="new_start" required className="input input-bordered w-full validator" />
                    <p className="validator-hint"><span>{t("common.fieldRequired")}</span></p>
                  </div>
                  <div className="form-control w-full ">
                    <label className="label">
                      <span className="label-text">{t("session.endDate")}</span>
                    </label>
                    <input type="date" placeholder={t("common.typeHere")} name="new_end" required className="input validator input-bordered w-full " />
                    <p className="validator-hint"><span>{t("common.fieldRequired")}</span></p>
                  </div>
                  <div>
                  </div>
                  <button className='btn btn-sm btn-outline btn-ghost btn-info'>
                    <span>
                      Changer
                    </span>
                    {
                      changingDates && <span className="loading loading-spinner loading-sm"></span>
                    }
                  </button>
                </form>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">{t("common.save")}</button>
              </form>
            </div>
          </div>
        </dialog>
        <div className="card bg-base-100 shadow-xl p-6 ml-4">
          <h1 className="text-2xl font-bold text-center mb-4 flex justify-between">
            <span>Sessions</span>
            <button
              className="btn btn-xs btn-info btn-outline btn-ghost"
              onClick={() => {
                (
                  document.getElementById(
                    "add_modal",
                  ) as HTMLDialogElement | null
                )?.showModal();
              }}
            >
              <RiAddLine size={20} />
            </button>
          </h1>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("session.name")}</th>
                  <th>{t("session.startDate")}</th>
                  <th>{t("session.endDate")}</th>
                  <th>{t("session.active")}</th>
                  <th>{t("session.createdAt")}</th>
                  <th>{t("session.updatedAt")}</th>
                  <th>{t("session.createdBy")}</th>
                  <th>{t("session.updatedBy")}</th>
                  <th>{t("session.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td    className="text-xl font-mono text-center font-semibold" colSpan={7}>
                      <span className="loading loading-lg loading-spinner"></span>
                    </td>
                  </tr>
                )}
                {called && data && data?.sessionInfos.length === 0 && (
                  <tr>
                    <td className="text-xl font-mono text-center font-semibold" colSpan={7}>
                      Aucune session trouvée
                    </td>
                  </tr>
                )}
                {data &&
                  data.sessionInfos.length > 0 &&
                  data.sessionInfos.map((session) => (
                    <tr key={session.id} className="mb-2">
                      <td>{session.id}</td>
                      <td>{session.name}</td>
                      <td>
                        {new Date(session.startDate).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(session.endDate).toLocaleDateString()}
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          name="toggler"
                          onClick={(e) => {
                            e.preventDefault();
                            toogle(Number.parseInt(session.id), session.active);
                          }}
                          checked={session.active}
                          className={`toggle ${session.active ? "text-green-600" : "text-red-600"} `}
                        />
                      </td>
                      {/* <td className="text-center">{! session.active ? <span aria-label="success" className="status status-lg status-error"></span> : <span aria-label="success" className="status status-lg status-success"></span>}</td> */}
                      <td>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </td>
                      <td>{session.createdBy.username}</td>
                      <td>{session.updatedBy.username}</td>
                      <td className="space-x-2">
                        <button
                          className="btn btn-sm btn-error btn-outline btn-ghost"
                          onClick={() => {
                            sessionDelete(Number.parseInt(session.id));
                          }}
                        >
                          <RiDeleteBin6Line
                            size={20}
                            className="text-error cursor-pointer"
                          />
                            </button>
                        <button className="btn btn-sm btn-warning btn-outline btn-ghost" onClick={() => {
                          setCurrId(Number.parseInt(session.id));
                          (
                            document.getElementById(
                              "update_session",
                            ) as HTMLDialogElement | null
                          )?.showModal();
                        }} ><RiEditLine /> </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
