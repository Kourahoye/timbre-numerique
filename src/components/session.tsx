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
import { RiAddLine, RiDeleteBin6Line } from "react-icons/ri";
import Swal from "sweetalert2";

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
export default function Session() {
  const [addsession, { loading: adding }] = useMutation(ADD_SESSION);
  const [error, setError] = useState("");
  const [loadSessions, { called, loading, data, refetch }] =
    useLazyQuery<Sessions>(ALL_SESSIONS);
  const [deleteSession] = useMutation(DELETE_SESSION);
  const [toogleSession] = useMutation(TOOGLE_ACTIVE_SESSION);

  useEffect(() => {
    loadSessions();
  }, []);

  const toogle = (id: number, active: boolean) => {
    Swal.fire({
      title: "Are you sure?",
      html: `${active ? "Voulez vous desactiver la session.<br/>Toutes les sessions seront desactivees" : "Voulez vous activer cette session.<br/>La session active sera desactiver"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${active ? "inactive" : "active"} it!`,
    }).then(async (result) => {
      if (!result.isConfirmed) {
        // e.preventDefault()
        return;
      }
      const toastId = toast.loading("Please wait...");
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
          toast.error("Erreur imprevue!", { id: toastId });
        });
    });
  };

  const sessionDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const toastId = toast.loading("Please wait...");
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
          toast.error("Erreur imprevue!", { id: toastId });
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
                Créer une nouvelle session{" "}
              </h1>
              <form
                method="post"
                className="space-y-3 flex flex-col items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  // console.log("==================================================================================",typeof(e))
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get("name") || null;
                  const start = formData.get("date_start") || null;
                  const end = formData.get("date_end") || null;
                  setError("");
                  if (start == null || end == null || name == null) {
                    toast.error("Error: Viellez remplir les champs", {});
                    return;
                  }
                  if (start >= end) {
                    setError("Start date must be before end date");
                    return;
                  }
                  const toastId = toast.loading("Adding session");
                  addsession({
                    variables: { name: name, start: start, end: end },
                  })
                    .then((res) => {
                      const data = res.data as AddSession;
                      // console.log(data)
                      // if (data == null){
                      // }
                      if (data.addSession.id) {
                        toast.success(`Session ${data.addSession.name} added`, {
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
                        toast.error("Une session avec ce nom existe deja", {
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
                    <span className="label-text">Name</span>
                    <span className="label-text-alt"></span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Type here"
                    className="input input-bordered w-full"
                  />
                  {/* <label className="label">
                    <span className="label-text-alt">
                     
                    </span>
                    <span className="label-text-alt"></span>
                  </label> */}
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Date Start</span>
                    <span className="label-text-alt"></span>
                  </label>
                  <input
                    type="date"
                    placeholder="Type here"
                    required
                    name="date_start"
                    className="input input-bordered w-full"
                  />
                  {/* <label className="label">
                    <span className="label-text-alt"></span>
                    <span className="label-text-alt"></span>
                  </label> */}
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Dated End</span>
                    <span className="label-text-alt"></span>
                  </label>
                  <input
                    type="date"
                    placeholder="Type here"
                    required
                    name="date_end"
                    className="input input-bordered w-full"
                  />
                  {/* <label className="label">
                    <span className="label-text-alt"></span>
                    <span className="label-text-alt"></span>
                  </label> */}
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
                  <span>Enregistrer</span>
                  {adding && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                </button>
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
                  <th>Name</th>
                  <th>Active</th>
                  <th>Created_at</th>
                  <th>updated_at</th>
                  <th>Created_by</th>
                  <th>updated_by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td    className="text-xl font-mono text-center font-semibold" colSpan={7}>
                      <span className="loading loading-lg loading-spinner"></span>{" "}
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
                      <td>
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
