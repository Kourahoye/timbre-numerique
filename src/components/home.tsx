import { gql } from "@apollo/client";
import QrCode from "./qrcode";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import { RiErrorWarningLine } from "react-icons/ri";
import toast from "react-hot-toast";
// import Swal from "sweetalert2";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SessionType } from "./types";
import DjomyPaymentModal from "./payment";


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
// const BUY =gql`
// mutation BUY($id:Int!) {
//   generateTimbre(typeId: $id) {
//     id
//   }
// }
// `;
export type TimbreType ={
  timbreType :{
    id:number
    name:string
  }[]
};
export  type timbreTYpes={
  getTimbrePrice :{
    price:number
    session: SessionType 
  }
}
function Home() {
  const {
    loading: loadingType,
    error: errortype,
    data: types,
    refetch: refetchType,
  } = useQuery<TimbreType>(GET_TYPE, {
      fetchPolicy: "cache-and-network",  // ✅ cache + diff
                        // ✅ skip si non connecté
    });
  const [getPrice, { loading: loadingPrice, data }] = useLazyQuery<timbreTYpes>(GET_TIMBRE_PRICE);
  // const [buy]= useMutation(BUY)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const {t} = useTranslation();

  return (
    <>
      <div className="hero h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="w-full">
            <h1 className="text-5xl font-bold">{t("common.getYours")}</h1>
            <div className="py-6 flex items-center justify-center">
              <QrCode />
            </div>
            <form
              method="post"
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
              //   Swal.fire({
              //     title: `${t("timbre.submitCard")}`,
              //     input: "text",    
              //     inputAttributes: { autocapitalize: "on" },
              //     showCancelButton: true,
              //     confirmButtonText: `${t('timbre.buy')}`,
              //     showLoaderOnConfirm: true,
              //     footer:'<strong>This is fake</strong>',
              //     preConfirm: async (login) => {
              //       if (login) {
              //         return;
              //       } else {
              //         Swal.showValidationMessage(`${t('timbre.provideInfo')}`);
              //       }
              //     },
              //     allowOutsideClick: () => !Swal.isLoading(),
              //   }).then((result) => {
              //     if (result.isConfirmed){
              //       // const _type = document.querySelector("#type")
              //       const toastId = toast.loading(`${t("common.pleaseWait")}`)
              //       if (_type ==null || _type =="" ){
              //         toast.error("Aucun type selectionner")
              //           toast.error(`${t("timbre.noType")}`)
              //         return
              //       }
              //         buy({variables:{id:Number.parseInt(_type.toString())}}).then((res)=>{
              //             if(res.data){
              //             toast.success(`${t("timbre.paymentSuccess")}`,{id:toastId})
              //           }
              //         }).catch((error)=>{
              //           toast.success(error.message,{id:toastId})
              //         }) 
              //       }
              //   });
              }
            }
            >
              <div className="flex flex-col items-start justify-start gap-2 w-full">
                <label className="label" htmlFor="type">
                  {t("timbre.type")}
                </label>
                <select
                  name="type"
                  required
                  className="select w-full"
                  defaultValue={"default"}
                  id="type"
                  onChange={(e) => {
                    const selectedId = Number.parseInt(e.target.value, 10);
                    setSelectedTypeId(selectedId);
                    getPrice({
                      variables: { id: selectedId },
                    }).catch((error) => {
                      // console.log(error);
                      if (error.message.includes("Authentication required")){
                        toast.error(`${t("common.loginRequired")}`);
                        return
                      }
                      toast.error(error.message);
                    });
                  }}
                >
                  <option disabled value={"default"}>
                    {t("timbre.pickTimbreType")}
                  </option>
                  {types &&
                    types.timbreType.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
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
                <span className="border-r-2 border-r-black px-4 dark:border-r-white text-lg">
                  {t("timbre.type")}
                </span>
                <span className="textarea-md">
                  {data && data.getTimbrePrice.price}
                </span>
                {loadingPrice && (
                  <span className="loading loading-spinner loading-md"></span>
                )}
              </div>
              {types && data ? (
               <DjomyPaymentModal 
                  amount={data?.getTimbrePrice.price || 0}
                  description=""
                  typeTimbre={
                    types?.timbreType.find(
                      item => item.id === Number.parseInt(selectedTypeId?.toString() || "0")
                    )?.name
                  }
                  type={Number.parseInt(selectedTypeId?.toString() || "0")}
                />
              ) : (
                <button className="btn btn-primary" disabled>
                  {t("timbre.buy")} 
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