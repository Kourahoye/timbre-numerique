import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { storeTokens } from "../services/manageTokens";
import { LOGIN_MUTATION } from "../graphql/mutations";
import { useTranslation } from "react-i18next";

export default function Login() {
  const {t} = useTranslation();
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

  const [form, setForm] = useState<LoginVariables>({
    username: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const [login, { loading }] = useMutation<LoginResponse, LoginVariables>(
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        if (!data?.tokenAuth?.success) {
          setErrorMsg(
            data?.tokenAuth?.errors?.nonFieldErrors?.[0]?.message ||
              t("auth.invalidCredentials"),
          );
          return;
        }
        const access = data.tokenAuth.token!.token;
        const refresh = data.tokenAuth.refreshToken!.token;
        storeTokens(access, refresh);
        setErrorMsg("");
        toast.success(`${t("auth.connectSuccess")}`);
        window.location.href = "/";
      },
      onError: () => setErrorMsg(`${t("auth.serverError")}`),
    },
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    login({ variables: form });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">{t("auth.login")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">{t("auth.username")}</span>
            </label>
            <input
              type="text"
              placeholder={t("auth.usernamePlaceholder")}
              className="input input-bordered"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">{t("auth.password")}</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {errorMsg && (
            <p className="text-error text-sm mb-3 text-center">{errorMsg}</p>
          )}
          <div className="form-control">
            <button className="btn btn-primary" type="submit">
              <span>{t("auth.login")}</span>
              <span
                className={`${loading ? "loading loading-spinner" : "hidden"}`}
              ></span>
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-4">
          {t("auth.noAccount")}
          <a href="/register" className="link link-primary ml-1">
            {t("auth.register")}
          </a>
        </p>
      </div>
    </div>
  );
}
