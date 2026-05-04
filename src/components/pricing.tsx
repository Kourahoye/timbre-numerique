import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
// import type { GetTypeTimbresQuery, Sessions } from "./types";
import { gql } from "@apollo/client";
import { RiAddLine, RiDeleteBin6Line, RiErrorWarningLine, RiRefreshFill } from "react-icons/ri";
import toast from "react-hot-toast";
import type { PriceAssignation, PriceType, SessionType } from "./types";
import { useState } from "react";
import Swal from "sweetalert2";

const GET_SESSION = gql`
query data {
  sessions {
    id
    name
}
}`;

const GET_TYPE = gql`
query data {
timbreType {
    id
    name
}}`;

const SET_TIMBRE_PRICE = gql`
mutation SET_TIMBRE_PRICE($price:Int!,$sessionId:Int!,$typeId:Int!) {
  assignPrice(price: $price, sessionId: $sessionId, typeId: $typeId) {
    id
    price
    session {
      name
    }
    type {
      name
    }
  }
}
`;
const GET_CURRENT_PRICES = gql`
query GET_CURRENT_PRICES {
   activeSessionPrice {
    id
    price
    session {
      name
    }
    type {
      name
    }
    updatedAt
    createdAt
    createdBy {
      username
    }
    updatedBy {
      username
    }
  }
}
`;
const All_PRICES = gql`
query All_PRICES {
  prices {
    createdAt
    createdBy {
      username
    }
    id
    price
    session {
      name
    }
    type {
      name
    }
    updatedAt
    updatedBy {
      username
    }
  }
}
`
const  DELETE_PRICE = gql`
mutation DELETE_PRICE($id:Int!) {
  deletePrice(id: $id) {
    message
    success
  }
}
`
export default function Price() {
  const [deletePrice] = useMutation<{deletePrice:{success:boolean,message:string}}>(DELETE_PRICE)
  const [plageTime,setPlageTime] = useState<string>("current")
  const {
    loading: loadingSessions,
    error: errorSession,
    data: sessions,
    refetch: refetchSession,
  } = useQuery<{sessions:SessionType[]}>(GET_SESSION);
  const {
    loading: loadingType,
    error: errortype,
    data: types,
    refetch: refetchType,
  } = useQuery(GET_TYPE);
  const {
    loading: loadingPrices,
    error: errorPrices,
    data: prices,
    refetch: refetchPrices,
  } = useQuery<PriceAssignation>(GET_CURRENT_PRICES);
  const [setTimbrePrice,{loading}] = useMutation(SET_TIMBRE_PRICE)
  const [loadAllPrices, { called, loading:loadingAll, data:allPrices,error:errorAllPrices,refetch:refetchAllPrices }] = useLazyQuery<{prices:PriceType[]}>(All_PRICES)

  const priceDelete = (id:number) => {
      Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(async (result) => {
    if (!result.isConfirmed) return
    const toastId = toast.loading("Please wait...")
    deletePrice({variables: { id: id }}).then((res) => {
        const data = res.data
        if (data){
          if (data.deletePrice.success == true) {
            toast.success(data.deletePrice.message, { id:toastId })
          } else {
            toast.error(data.deletePrice.message, { id:toastId })
          }
        }else if (res.error){      
          toast.error(res.error.message, { id:toastId })
        }else{
          console.log(res)
        }
      refetchPrices();
      if (called) refetchAllPrices();
    }).catch((error) => {
      if(error){
        toast.error(error.message,{id: toastId});
        return
      }
      toast.error("Erreur imprevue!",{id: toastId});
    });
  })
  }

  return (
    <>
      <dialog id="add_pricing_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-4">New Price</h1>
            <form
              method="post"
              className="space-y-3 flex flex-col items-center"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const _session = form.get("session") || null;
                const _type = form.get("type") || null;
                const _price = form.get("price") || null;
                if (
                  _session == "" ||
                  _type == "" ||
                  _price == "" ||
                  _session == null ||
                  _type == null ||
                  _price == null
                ) {
                  toast.error("Remplissez le formulaire");
                  return;
                }
                const toastId = toast.loading("Please wait...");
                setTimbrePrice({
                  variables: {
                    price: Number.parseInt(_price.toString()),
                    sessionId: Number.parseInt(_session.toString()),
                    typeId: Number.parseInt(_type.toString()),
                  },
                })
                  .then((res) => {
                    const data = res.data;
                    refetchPrices()
                    if(called)refetchAllPrices()
                    if (data) {
                      toast.success("Prix assigner avec success", {
                        id: toastId,
                      });
                    } else {
                      toast.error(data.message, { id: toastId });
                    }
                  })
                  .catch((err) => {
                    if (err.message.includes("UNIQUE constraint failed")) {
                      toast.error(
                        "Un prix est deja assigner pour cette session pour ce type de timbre",
                        { id: toastId },
                      );
                      return;
                    }
                    toast.error(err.message, { id: toastId });
                  });
              }}
            >
              <div className="flex gap-2 w-full">
                <select
                  name="session"
                  required
                  className="select w-full"
                  defaultValue={"default"}
                >
                  <option disabled value={"default"}>
                    Pick the session
                  </option>
                  {sessions &&
                    sessions.sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                </select>
                {loadingSessions && (
                  <span className="loading loading-xs loading-spinner"></span>
                )}
                {errorSession && (
                  <RiErrorWarningLine
                    onClick={refetchSession}
                    className="text-red-600"
                  />
                )}
              </div>

              <div className="flex gap-2 w-full">
                <select
                  name="type"
                  required
                  className="select w-full"
                  defaultValue={"default"}
                >
                  <option disabled value={"default"}>
                    Pick the timbre type
                  </option>
                  {types &&
                    types.timbreType.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  {types && console.log(types)}
                </select>
                {loadingType && (
                  <span className="loading loading-xs loading-spinner"></span>
                )}
                {errortype && (
                  <RiErrorWarningLine
                    onClick={refetchType}
                    className="text-red-600"
                  />
                )}
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Prix</span>
                </label>
                <input
                  type="number"
                  placeholder="Type here"
                  name="price"
                  required
                  className="input input-bordered w-full"
                />
              </div>
              <button
                type="submit"
                className="btn btn-info btn-sm btn-outline btn-ghost"
              >
                <span>Set price</span>
                {loading && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <div className="card bg-base-100 shadow-xl p-6 ml-4">
          <h1 className="text-2xl font-bold text-center mb-4 flex justify-between">
            <section>
              <span>Pricing</span>
              {
                plageTime == "current" &&
              <div className="badge badge-accent badge-xs ml-2">This year</div>
            }
              {
                plageTime == "all" &&
                <div className="badge badge-accent badge-xs ml-2">All years</div>
              }
            </section>

            <button
              className="btn btn-xs btn-info btn-outline btn-ghost"
              onClick={() => {
                (
                  document.getElementById(
                    "add_pricing_modal",
                  ) as HTMLDialogElement | null
                )?.showModal();
              }}
            >
              <RiAddLine size={20} />
            </button>
          </h1>
            <div className="tabs tabs-lift">
              <label className="tab">
                <input type="radio" name={`my_tabs`} defaultChecked  onChange={()=>setPlageTime("current")} />
                <span className="font-semibold">This year</span>
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">
               <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>Session</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Created_at</th>
                  <th>updated_at</th>
                  <th>Created_by</th>
                  <th>updated_by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPrices && (
                  <tr>
                    <td className="text-center" colSpan={9}>
                      <span className="loading loading-lg loading-spinner"></span>{" "}
                    </td>
                  </tr>
                )}
                {prices && prices?.activeSessionPrice.length === 0 && (
                  <tr>
                    <td className="text-xl font-mono text-center font-semibold" colSpan={9}>
                      Aucun prix trouvé pour l'annee
                    </td>
                  </tr>
                )}
                {errorPrices && (
                  <tr>
                    <td className="text-xl" colSpan={9}>
                      {errorPrices.message}
                      <RiRefreshFill onClick={refetchPrices} />
                    </td>
                  </tr>
                )}
                {prices &&
                  prices.activeSessionPrice.length > 0 &&
                  prices.activeSessionPrice.map((price) => (
                    <tr key={price.id} className="mb-2">
                      <td>{price.id}</td>
                      <td>{price.session.name}</td>
                      <td>{price.type.name}</td>
                      <td>{price.price}</td>
                      <td>{new Date(price.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(price.updatedAt).toLocaleDateString()}</td>
                      <td>{price.createdBy.username}</td>
                      <td>{price.updatedBy.username}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error btn-outline btn-ghost"
                          onClick={() => {priceDelete(Number.parseInt(price.id))}}
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
              <label className="tab">
                <input type="radio" name={`my_tabs`} onChange={()=>setPlageTime("all")} />
                <span className="font-semibold">All years</span>
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">
                  <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>Session</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Created_at</th>
                  <th>updated_at</th>
                  <th>Created_by</th>
                  <th>updated_by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  !called && <tr><td colSpan={9} className="text-center">
                    <button type="button" className="btn btn-outline btn-accent btn-ghost btn-wide" onClick={()=>loadAllPrices()} >Load all prices</button>
                    </td>
                    </tr>
                }
                {loadingAll && (
                  <tr>
                    <td className="text-center" colSpan={9}>
                      <span className="loading loading-lg loading-spinner"></span>{" "}
                    </td>
                  </tr>
                )}
                {allPrices && allPrices?.prices.length === 0 && (
                  <tr>
                    <td className="text-xl font-mono text-center font-semibold" colSpan={9}>
                      Aucun prix trouvé
                    </td>
                  </tr>
                )}
                {errorAllPrices && (
                  <tr>
                    <td className="text-xl" colSpan={9}>
                      {errorAllPrices.message}
                      <RiRefreshFill onClick={refetchAllPrices} />
                    </td>
                  </tr>
                )}
                {allPrices &&
                  allPrices.prices.length > 0 &&
                  allPrices.prices.map((price) => (
                    <tr key={price.id} className="mb-2">
                      <td>{price.id}</td>
                      <td>{price.session.name}</td>
                      <td>{price.type.name}</td>
                      <td>{price.price}</td>
                      <td>{new Date(price.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(price.updatedAt).toLocaleDateString()}</td>
                      <td>{price.createdBy.username}</td>
                      <td>{price.updatedBy.username}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error btn-outline btn-ghost"
                          onClick={() => {priceDelete(Number.parseInt(price.id))}}
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
          </div>
        </div>
    </>
  );
}