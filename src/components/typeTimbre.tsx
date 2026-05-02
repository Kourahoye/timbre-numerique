import { useEffect, useState } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import type { DeleteTypeMutationResponse, GetTypeTimbresQuery } from "./types";
import { RiAddLine, RiDeleteBin6Line } from "react-icons/ri";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";

const AddType = gql`
  mutation AddType($name: String!) {
    addTimreType(name: $name) {
      id
      name
    }
  }
`;
const GET_TYPE_TIMBRES = gql`
  query GetTypeTimbres {
    getTimbresType {
      createdAt
      createdBy {
        username
      }
      name
      updatedAt
      id
      updatedBy {
        username
      }
    }
  }
`;
const DELETE_TYPE = gql`
  mutation DeleteType($id: Int!) {
    deleteTypeTimbre(id: $id) {
      success
      message
    }
  }
`;
export default function TypeTimbre() {
  const [error, setError] = useState("");
  const [addType, { loading: load }] = useMutation(AddType);
  const [name, setName] = useState("");
  const [loadTypeTimbre, { called, loading, data, refetch }] =
    useLazyQuery<GetTypeTimbresQuery>(GET_TYPE_TIMBRES);
  const [deleteTimbreType] = useMutation(DELETE_TYPE);

  const deleteType = (id: number) => {
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
      deleteTimbreType({ variables: { id: id } })
        .then((res) => {
          const data: DeleteTypeMutationResponse =
            res.data as DeleteTypeMutationResponse;
          if (data.deleteTypeTimbre.success) {
            toast.success(data.deleteTypeTimbre.message, { id: toastId });
          } else {
            toast.error(data.deleteTypeTimbre.message, { id: toastId });
          }
          refetch();
        })
        .catch(() => {
          toast.error("Erreur imprevue!", { id: toastId });
        });
    });
  };

  useEffect(() => {
    loadTypeTimbre();
  });

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
                Créer un type de timbre
              </h1>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim() === "") {
                    setError("Le nom du type de timbre est requis.");
                    return;
                  } else {
                    setError("");
                  }
                  addType({ variables: { name: name } })
                    .then(() => {
                      toast.success("Type de timbre créé avec succès !");
                      refetch();
                    })
                    .catch((err) => {
                      if (err.message.includes("timbre_typetimbre.name")) {
                        setError("Ce type de timbre existe déjà.");
                        return;
                      }
                      setError(err.message);
                    });
                }}
              >
                <div className="input w-full">
                  <input
                    required
                    type="text"
                    value={name}
                    name="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Type de timbre"
                    className="w-full"
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
                <button
                  className="btn btn-sm btn-info btn-outline btn-ghost w-full mt-4"
                  type="submit"
                >
                  Créer
                  {load && (
                    <span className="loading loading-sm loading-spinner"></span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </dialog>
        <div className="card bg-base-100 shadow-xl p-6 ml-4">
          <h1 className="text-2xl font-bold text-center mb-4 flex justify-between">
            <span>Types de timbres</span>
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
                  <th>Created at</th>
                  <th>updated at</th>
                  <th>Created by</th>
                  <th>updated by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="text-center">
                    <td colSpan={6}>
                      <span className="loading loading-lg loading-spinner"></span>{" "}
                    </td>
                  </tr>
                )}
                {called && data && data?.getTimbresType.length === 0 && (
                  <tr>
                    <td className="text-xl" colSpan={6}>
                      Aucun type de timbre trouvé
                    </td>
                  </tr>
                )}
                {data &&
                  data.getTimbresType.length > 0 &&
                  data.getTimbresType.map((type) => (
                    <tr key={type.id} className="mb-2">
                      <td>{type.id}</td>
                      <td>{type.name}</td>
                      <td>{new Date(type.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(type.updatedAt).toLocaleDateString()}</td>
                      <td>{type.createdBy.username}</td>
                      <td>{type.updatedBy.username}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error btn-outline btn-ghost"
                          onClick={() => deleteType(Number.parseInt(type.id))}
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
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName="" //the toast all the screen
          toasterId="default"
          toastOptions={{
            // Define default options
            className:
              "card shadow shadow-slate-950 ring ring-red-600 bg-white",
            duration: 3000,
            removeDelay: 3000,
            style: {
              background: "#FFFFFFFF",
              color: "#000000",
            },

            // Default options for specific types
            success: {
              duration: 3000,
              iconTheme: {
                primary: "green",
                secondary: "black",
              },
            },
          }}
        />
      </div>
    </>
  );
}
