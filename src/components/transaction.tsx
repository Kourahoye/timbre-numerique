import { useParams } from "react-router-dom";
import { useLazyQuery } from "@apollo/client/react";
import { SCAN } from "../graphql/queries";
import type { ScanAgrs, ScanData } from "./types";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
export default function Transaction(){
        const { qr } = useParams();
        const [ scan, { loading, error, data }] = useLazyQuery<ScanData,ScanAgrs>(SCAN);

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
            toast.error("Donnez le code")
            return;
        }
         scan({variables:{ref:code.toString()}})
    }
    return <>
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-200">
      <form onSubmit={(e)=>{
                scanCode(e)
            }}  className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-5">
              <div className="form-control input input-bordered  w-full max-w-xs">
                <label className="label">
                  <span className="label-text font-mono">Code</span>
                </label>
                <input type="search" placeholder="Type here" name="code" required className="w-full" />
              </div>
              <button className='btn btn-sm btn-info'> Search </button>
          </div>
          {loading ?? <div className="loading-spinner loading loading-lg" ></div>  }
          {error && <p className="alert alert-error">Error: {error.message}</p>}
          {data != undefined && ( <div className="card w-96 bg-base-100 shadow-xl p-6">
              <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
              <p><strong>Reference:</strong> {data.scan.reference}</p>
              <p><strong>Type:</strong> {data.scan.type.name}</p>
              <p className="flex items-center gap-4"><strong>Status:</strong> {data.scan.used ? <span aria-label="success" className="status status-lg status-error"></span> : <span aria-label="success" className="status status-lg status-success"></span>}</p>
              {
                  data.scan.used == false &&
                  <button className='btn btn-warning btn-ghost btn-outline mt-5'>Consommer</button>
              }
          </div>)}
      </form>
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
}