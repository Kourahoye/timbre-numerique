import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { SCAN } from "../graphql/queries";
export default function Transaction(){
        const { qr } = useParams();
        const { loading, error, data } = useQuery(SCAN,{
            variables: {ref: qr }
        }
        );
    return <>
    <div className="min-h-screen flex justify-center items-center bg-base-200">
        {loading ?? <div className="loading-spinner loading loading-lg" ></div>  }
        {error && <p className="text-error">Error: {error.message}</p>}
        {data != undefined && ( <div className="card w-96 bg-base-100 shadow-xl p-6">
            <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
            <p><strong>Reference:</strong> {data.scan.reference}</p>
            <p><strong>Type:</strong> {data.scan.type.name}</p>
            <p><strong>Status:</strong> {data.scan.used ? "Used" : "Unused"}</p>
        </div>)}
    </div>
    </>
}