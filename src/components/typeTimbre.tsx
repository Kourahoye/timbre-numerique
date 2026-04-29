import { useEffect, useState } from "react";
import {useMutation,useLazyQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

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
  }}

`
export default function TypeTimbre(){
    const [error,setError] = useState("");
    const [success,setSuccess] = useState("");
    const [addType] = useMutation(AddType);
    const [name, setName] = useState("");
    const [loadTypeTimbre, { called, loading, data }] = useLazyQuery(GET_TYPE_TIMBRES);

    useEffect(()=>{
      loadTypeTimbre();
    },[]);

    return <>
    <div className="min-h-screen flex flex-row justify-center items-center bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl p-6">
            <h1 className="text-2xl font-bold text-center mb-4">Créer un type de timbre</h1>
            <form className="space-y-2" onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim() === "") {
                        setError("Le nom du type de timbre est requis.");
                        return;
                    }else{
                        setError("");
                    }
                    // const input = e.target.elements[0];
                    addType({ variables: { name: name } }).then(()=>{
                      //  console.log(result);
                        setSuccess("Type de timbre créé avec succès !");
                    }).catch((err)=>{
                      if (err.message.includes("timbre_typetimbre.name")){
                        setError("Ce type de timbre existe déjà.");
                        return;
                      }
                        setError(err.message);
                    });
                  }}>
                <div className="input w-full" >
                    <input required type="text" value={name} name="name" onChange={(e)=>setName(e.target.value)} placeholder="Type de timbre" className="w-full" />
                </div>
                {
                    error && <div role="alert" className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                    </div>
                }
                {
                  success && <div role="alert" className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{success}</span>
                  </div>
                }
                <button className="btn btn-sm btn-info btn-outline btn-ghost w-full mt-4" type="submit">Créer</button>   
            </form>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl p-6 ml-4">
            <h1 className="text-2xl font-bold text-center mb-4">Types de timbres existants</h1>
            <div className="overflow-x-auto">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Created_at</th>
                    <th>updated_at</th>
                    <th>Created_by</th>
                    <th>updated_by</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    loading && <tr><td className="loading loading-lg loading-spinner text-center" colSpan={6}></td></tr>
                  }
                    {
                       called && data && data?.getTimbresType.length === 0 && <tr><td className="text-xl" colSpan={6}>Aucun type de timbre trouvé</td></tr>
                    }
                  <tr>
                    <th>1</th>
                    <td>Cy Ganderton</td>
                    <td>Quality Control Specialist</td>
                    <td>Blue</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          
            {
                data && data.getTimbresType.length > 0 && (
                    <ul className="list-disc list-inside">
                        {data.getTimbresType.map((type) => (
                            <li key={type.id} className="mb-2">
                                <strong>{type.name}</strong><br />
                                Créé par: {type.createdBy.username} le {new Date(type.createdAt).toLocaleDateString()}<br />
                                Mis à jour par: {type.updatedBy.username} le {new Date(type.updatedAt).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                )
            }
        </div>
    </div>
    </>   
}