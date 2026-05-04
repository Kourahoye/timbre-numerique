import { gql } from "@apollo/client";
import QrCode from "./qrcode";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { RiErrorWarningLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useState } from "react";

const GET_TYPE = gql`
query data {
timbreType {
    id
    name
}}`;
const GET_TIMBRE_PRICE = gql`
query GET_TIMBRE_PRICE($id:Int!) {
  getTimbrePrice(id: $id) {
    price
    session {
      name
    }
  }
}
`;
const BUY =gql`
mutation BUY {
  generateTimbre(typeId: 1) {
    id
  }
}
`;
function Home() {
  const {
    loading: loadingType,
    error: errortype,
    data: types,
    refetch: refetchType,
  } = useQuery(GET_TYPE);
  const [getPrice, { loading: loadingPrice, data }] = useLazyQuery(GET_TIMBRE_PRICE);
  const [buy]= useMutation(BUY)
  const [_type,setType]=useState("");

  return (
    <>
      <div className="hero h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="w-full">
            <h1 className="text-5xl font-bold">Get your timbre</h1>
            <div className="py-6 flex items-center justify-center">
              <QrCode />
            </div>
            <form
              method="post"
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                Swal.fire({
                  title: "Submit your card",
                  input: "text",
                  
                  inputAttributes: { autocapitalize: "on" },
                  showCancelButton: true,
                  confirmButtonText: "Payer",
                  showLoaderOnConfirm: true,
                  footer:'<strong>This is fake</strong>',
                  preConfirm: async (login) => {
                    if (login) {
                      return;
                    } else {
                      Swal.showValidationMessage(`Fournissez les infos`);
                    }
                  },
                  allowOutsideClick: () => !Swal.isLoading(),
                }).then((result) => {
                  if (result.isConfirmed){
                    // const _type = document.querySelector("#type")
                    const toastId = toast.loading("Please wait...")
                    if (_type ==null || _type =="" ){
                      toast.error("Aucun type selectionner")
                      return
                    }
                      buy({variables:{id:Number.parseInt(_type.toString())}}).then((res)=>{
                          if(res.data){
                          toast.success("Payement effectuer",{id:toastId})
                        }
                      }).catch((error)=>{
                        toast.success(error.message,{id:toastId})
                      }) 
                    }
                });
              }}
            >
              <div className="flex flex-col items-start justify-start gap-2 w-full">
                <label className="label" htmlFor="type">
                  Type timbre
                </label>
                <select
                  name="type"
                  required
                  className="select w-full"
                  defaultValue={"default"}
                  id="type"
                  onChange={(e) =>
                    getPrice({
                      variables: { id: Number.parseInt(e.target.value) },
                    }).then((res) => {
                        // console.log(res);
                        if(res.data){                  
                          setType(e.target.value)
                        }
                        return
                      })
                      .catch((error) => {
                        console.log(error);
                        toast.error("Ce type n'est pas encore disponible dans la session courante");
                        // toast.error("PriceAssignation matching query does not exist")
                      })
                  }
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
                  {/* {types && console.log(types)} */}
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

              <div className="input w-full p-2">
                <span className="border-r-2 border-r-black px-4 text-black text-lg">
                  Prix
                </span>
                <span className="textarea-md">
                  {data && data.getTimbrePrice.price}
                </span>
                {loadingPrice && (
                  <span className="loading loading-spinner loading-md"></span>
                )}
              </div>
              {data ? (
                <button className="btn btn-primary">Buy</button>
              ) : (
                <button className="btn btn-primary" disabled>
                  Buy
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;