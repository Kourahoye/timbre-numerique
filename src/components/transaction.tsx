import { useParams } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { SCAN } from "../graphql/queries";
import type { ScanAgrs, ScanData } from "./types";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { gql } from "@apollo/client";
import { useTranslation } from "react-i18next";


const CONSUME_TIMBRE = gql`
mutation CONSUME_TIMBRE($id:Int!){
  initTransaction(timbre: $id) {
    id
  }
}
`;
export default function Transaction(){
        const { qr } = useParams();
         const {t} = useTranslation();
        const [ scan, { loading, error, data }] = useLazyQuery<ScanData,ScanAgrs>(SCAN);
        const [consumeTimbre] = useMutation(CONSUME_TIMBRE);

    useEffect(()=>{
        if(qr != "" && qr != null) {
            scan({variables:{ref:qr}})
        }
    },[])
    const scanCode = (e:HTMLFormElement)=>{
         e.preventDefault()
         const form = new FormData(e.currentTarget)
         const code = form.get("code") || null
        if(code =="" || code ==null){
            toast.error(`${t("scan.provideCode")}`)
            return;
        }
         scan({variables:{ref:code.toString()}})
    }

    const consume = ()=>{
       const toastId = toast.loading(`${t("common.pleaseWait")}`)
       if(data){

         consumeTimbre({variables:{id:Number.parseInt(data?.scan.id.toString())}}).then((res)=>{
           if (res.data){
             toast.success(`${t("transaction.requestSuccess")}`,{id:toastId})
            }
            if ( res.error){
              toast.error(res.error.message,{id:toastId})
            }
        }).catch((error)=>{
          if (error){
            toast.error(error.message,{id:toastId})
          }
        })
      }else{
        toast.error(`${"scan.selectTimbre"}`)
      }
    }
    return <>
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-200">
      <form onSubmit={(e)=>{
                scanCode(e)
            }}  className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-5">
              <div className="form-control input input-bordered  w-full max-w-xs">
                <label className="label">
                  <span className="label-text font-mono">{t("scan.code")}</span>
                </label>
                <input type="search" placeholder={t("common.typeHere")} name="code" required className="w-full" />
              </div>
              <button className='btn btn-sm btn-info'> {t("common.search")} </button>
          </div>
          {loading ?? <div className="loading-spinner loading loading-lg" ></div>  }
          {error && <p className="alert alert-error">{t("common.error")}:<br/> {error.message}</p>}
          {data != undefined && ( <div className="card w-96 bg-base-100 shadow-xl p-6">
              <h1 className="text-2xl font-bold mb-4">{t("timbre.details")}</h1>
              <p><strong>{t("timbre.reference")}:</strong> {data.scan.reference}</p>
              <p><strong>{t("timbre.type")}:</strong> {data.scan.type.name}</p>
              <p className="flex items-center gap-4"><strong>{t("timbre.status")}:</strong> {data.scan.used ? <span aria-label="success" className="status status-lg status-error"></span> : <span aria-label="success" className="status status-lg status-success"></span>}</p>
              {
                  data.scan.used == false &&
                  <button className='btn btn-warning btn-ghost btn-outline mt-5' onClick={consume}>{t("scan.consumme")}</button>
              }
          </div>)}
      </form>
    </div>
    </>
}