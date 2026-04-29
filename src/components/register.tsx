import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {REGISTER_MUTATION } from "../graphql/mutations";


export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const typedData = data as {
        register: {
          success: boolean;
          errors?: {
            password1?: { message: string }[];
            password2?: { message: string }[];
            email?: { message: string }[];
            username?: { message: string }[];
            nonFieldErrors?: { message: string }[];
          };
          token?: { token: string; refreshToken: string };
        };
      };
      // console.log(typedData)
      if (!typedData?.register?.success) {
        const errors = typedData?.register?.errors;
        const errorText =
          errors?.password1?.[0]?.message ||
          errors?.password2?.[0]?.message ||
          errors?.email?.[0]?.message ||
          errors?.username?.[0]?.message ||
          errors?.nonFieldErrors?.[0]?.message ||
          "Une erreur est survenue.";

        setErrorMsg(errorText);
        setSuccessMsg("");
        return;
      }

      setErrorMsg("");

      // si tu as désactivé l'activation email :
      if (typedData.register.token?.token) {
        localStorage.setItem("access", typedData.register.token.token);
        localStorage.setItem("refresh", typedData.register.token.refreshToken);
      }

      setSuccessMsg("Compte créé avec succès !");
      setTimeout(() => (window.location.href = "/login"), 1000);
    },
    onError: () => setErrorMsg("Erreur serveur."),
  });

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    register({ variables: form });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Créer un compte</h1>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Nom d'utilisateur</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />
          </div>

          {/* Email */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              placeholder="exemple@mail.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password 1 */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Mot de passe</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              placeholder="••••••••"
              value={form.password1}
              onChange={(e) =>
                setForm({ ...form, password1: e.target.value })
              }
              required
            />
          </div>

          {/* Password 2 */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Confirmer mot de passe</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              placeholder="••••••••"
              value={form.password2}
              onChange={(e) =>
                setForm({ ...form, password2: e.target.value })
              }
              required
            />
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-error text-sm text-center mb-2">{errorMsg}</p>
          )}

          {/* Success */}
          {successMsg && (
            <p className="text-success text-sm text-center mb-2">
              {successMsg}
            </p>
          )}

          {/* Submit */}
          <div className="form-control mt-2">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
            >
              S'inscrire
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-4">
          Déjà un compte ?
          <a href="/login" className="link link-primary ml-1">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
