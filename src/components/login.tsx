import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { storeTokens } from "../services/manageTokens";
import { LOGIN_MUTATION } from "../graphql/mutations";

export default function Login() {
  type LoginResponse = {
    tokenAuth: {
      success: boolean;
      errors?: { nonFieldErrors?: { message: string }[] };
      token?: { token: string };
      refreshToken?: { token: string };
    };
  };

  type LoginVariables = {
    username: string;
    password: string;
  };

  const [form, setForm] = useState<LoginVariables>({ username: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const [login, { loading }] = useMutation<LoginResponse, LoginVariables>(
    
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        // console.log(data)
        if (!data?.tokenAuth?.success) {
          setErrorMsg(
            data?.tokenAuth?.errors?.nonFieldErrors?.[0]?.message ||
              "Identifiants invalides"
          );
          return;
        }

      const access = data.tokenAuth.token!.token;
      const refresh = data.tokenAuth.refreshToken!.token;

      // localStorage.setItem("access", access);
      // localStorage.setItem("refresh", refresh);
      storeTokens(access,refresh)
      setErrorMsg("");
      toast.success("Connected successfully")
      window.location.href = "/"; // redirection après login
    },
    onError: () => setErrorMsg("Erreur serveur, réessayez."),
  });

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    login({ variables: form });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Connexion</h1>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Nom d'utilisateur</span>
            </label>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              className="input input-bordered"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />
          </div>

          {/* Password */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Mot de passe</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <p className="text-error text-sm mb-3 text-center">{errorMsg}</p>
          )}

          {/* Submit */}
          <div className="form-control">
            <button
              className="btn btn-primary"
              type="submit"
            >
              <span>
              Se connecter
              </span> 
              <span className={`${loading ? "loading loading-spinner" : "hidden"}`}></span>
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-4">
          Pas de compte ?
          <a href="/register" className="link link-primary ml-1">
            S'inscrire
          </a>
        </p>
      </div>
      <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""//the toast all the screen
                toasterId="default"
                toastOptions={{
                  // Define default options
                  className: 'card shadow shadow-slate-950 ring ring-red-600 bg-white',
                  duration: 3000,
                  removeDelay: 3000,
                  style: {
                    background: '#FFFFFFFF',
                    color: '#000000',
                  },
        
                  // Default options for specific types
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: 'green',
                      secondary: 'black',
                    },
                  },
                }}
        />
    </div>
  );
}
