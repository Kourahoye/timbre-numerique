import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const FIND_TRANSACTION = gql`
query FIND_TRANSACTION($id:Int!) {
  findTransaction(id: $id) {
    id
    timbre {
      price {
        id
        price
        session {
          name
        }
        type {
          name
        }
      }
      qrCode
      reference
      type {
        name
      }
      used
      ownedBy {
        username
      }
      id
    }
    status
  }
}
`;
export type TranscType = {
    findTransaction : {
    id:number
    timbre :{
      price :{
        id:number
        price:number
        session :{
          name:string
        }
        type :{
          name:string
        }
      }
      qrCode:string
      reference:string
      type: {
        name:string
      }
      used:boolean
      ownedBy :{
        username:string
      }
      id:number
    }
    status:string
  }
}
const GIVE_RESPONSE = gql`
mutation MyMutation($action:String!,$id:Int!) {
  endTransactions(action: $action, transactionId: $id) {
    message
    success
  }
}`;
export default function FindTransaction(){
    const { idTranction } = useParams();
    const [loadTransaction, { loading, data,error }] = useLazyQuery<TranscType>(FIND_TRANSACTION)
    const [giveResponse] = useMutation<{endTransactions:{message:string,success:boolean}}>(GIVE_RESPONSE)
    const me  =  localStorage.getItem("me")
    useEffect(()=>{
       loadTransaction({variables:{id:Number.parseInt(idTranction?.toString())}}) 
    },[])

    const answer = (id:number,choix:string)=>{
        if(choix != "accepted" && choix !="rejected"){
            toast.error("Choix invalid")
        }
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proced!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const toastId = toast.loading("Please wait...");
      giveResponse({ variables: { id: Number.parseInt(id.toString()),action:choix } })
        .then((res) => {
          const data =res.data 
          if(data){

              if (data.endTransactions.success) {
                  toast.success(data.endTransactions.message, { id: toastId });
                } else {
                    toast.error(data.endTransactions.message, { id: toastId });
                }
                // refetch();
            }else{
                if(res.error){
                    toast.error(res.error?.message)
                }
            }
        })
        .catch((error) => {
          toast.error(error.message, { id: toastId });
        });
    });
        
    }
    return <>
      <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-base-200 w-full">
        {
            loading && <span className="loading loading-spinner loading-lg"></span>
        }
        {
            error && <div role="alert" className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error.message}</span>
            </div>
        }
        {
            data && (
            <div className="card w-96 bg-base-100 shadow-xl p-6">
              <h1 className="text-2xl font-bold mb-4">Autoriser la transaction</h1>
              <h1 className="text-xl font-bold mb-4">Timbre Details</h1>
              <p><strong>Reference:</strong> {data.findTransaction.timbre.reference}</p>
              <p><strong>Session:</strong> {data.findTransaction.timbre.price.session.name}</p>
              <p><strong>Type:</strong> {data.findTransaction.timbre.type.name}</p>
              <p><strong>Prix:</strong> {data.findTransaction.timbre.price.price}GNF</p>
              <p className="flex items-center gap-4"><strong>Status:</strong> {data.findTransaction.timbre.used ? <span aria-label="success" className="status status-lg status-error"></span> : <span aria-label="success" className="status status-lg status-success"></span>}</p>
               {
                data.findTransaction.status == "pending" && data.findTransaction.timbre.ownedBy.username == me && (<div className="space-x-2">
                  <button className='btn btn-info btn-ghost btn-outline mt-5' onClick={()=>answer(Number.parseInt(data.findTransaction.id.toString()),"rejected")}>Non</button>
                  <button className='btn btn-warning btn-ghost btn-outline mt-5' onClick={()=>answer(Number.parseInt(data.findTransaction.id.toString()),"accepted")}>oui</button>
                </div>
                )
                }
          </div>
            )
        }
      </div>
    </>
}