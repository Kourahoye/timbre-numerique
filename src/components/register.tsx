import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {REGISTER_MUTATION } from "../graphql/mutations";
import { useTranslation } from "react-i18next";


export default function Register() {
  const {t} = useTranslation();
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
          `${t("common.error")}`;

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

      setSuccessMsg(`${t("auth.accountCreated")}`);
      setTimeout(() => (window.location.href = "/login"), 1000);
    },
    onError: () => setErrorMsg(`${t("auth.serverError")}`),
  });

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    register({ variables: form });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">{t("auth.register")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">{t("auth.username")}</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder={t("auth.usernamePlaceholder")}
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">{t("auth.email")}</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              placeholder={t("auth.emailPlaceholder")}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">{t("auth.password")}</span>
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
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">{t("auth.confirmPassword")}</span>
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
          {errorMsg && (
            <p className="text-error text-sm text-center mb-2">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-success text-sm text-center mb-2">
              {successMsg}
            </p>
          )}
          <div className="form-control mt-2">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? t("common.loading") : ""}`}
            >
              {t("auth.register")}
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-4">
          {t("auth.alreadyAccount")}
          <a href="/login" className="link link-primary ml-1">
            {t("auth.login")}
          </a>
        </p>
      </div>
    </div>
  );
}
