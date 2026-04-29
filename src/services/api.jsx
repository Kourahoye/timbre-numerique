import axios from "axios";


// creation d'une instance axios de base
const api = axios.create({
    baseURL:'https://parinari.pythonanywhere.com/graphql/',
    timeout:1000,
    headers:{
        'Content-Type':'application/json',
        'Accept':'application/json'
    }
});


//intercepteur pour rqjouter le token jwt
// api.interceptors.request.use(
//     (config)=>{
//         const token = localStorage.getItem("token");
//         if (token){
//             config.headers.Authorization =`Bearer ${token}`;
//         }
//         return config;
//     }
// );

// interceptor pour gerer les reponse

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if(error.response){
//             const {status} = error.response;
//             switch (status) {
//                 case 401:
//                     console.error("Not authorized");
//                    if (error.response.data?.code === "token_not_valid") {
//                         localStorage.removeItem("token");
//                     }
//                     break;
//                 case 403:
//                     console.error("Access refused");
//                     break;
//                 case 404:
//                     console.error("Not Found");
//                     break;
//                 case 500:
//                     console.error("Erreur interne");
//                     break;
//                 case error.request:
//                     console.error("Aucune reponse");
//                     break;
//                 default:
//                     console.error("Erreur:",error.message)
//                     break;
//             }
//             return Promise.reject(error);
//         }
//     }
// )



export default api;