import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { storeTokens } from "../services/manageTokens";
import { LOGIN_MUTATION } from "../graphql/mutations";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Login() {
  const { t } = useTranslation();
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
  const [showPassword, setShowPassword] = useState(false);

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
      onError: () => {
        setErrorMsg(`${t("auth.serverError")}`);
      },
    },
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    login({ variables: form });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4">
      {/* Carte principale avec effet de survol */}
      <div className="card w-full max-w-md bg-base-100 shadow-2xl hover:shadow-xl transition-all duration-300">
        <div className="card-body p-8">
          {/* En-tête avec icône et titre */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg animate-bounce-slow">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("auth.login")}
            </h1>
            <p className="text-sm text-base-content/70 mt-2">
              {t("auth.welcomeBack")}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ nom d'utilisateur */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {t("auth.username")}
                </span>
              </label>
              <input
                type="text"
                placeholder={t("auth.usernamePlaceholder")}
                className="input input-bordered input-primary w-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
              />
            </div>

            {/* Champ mot de passe */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  {t("auth.password")}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered input-primary w-full pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {errorMsg && (
              <div className="alert alert-error shadow-lg animate-shake">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Lien mot de passe oublié */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-xs link link-hover text-primary/80 hover:text-primary transition-colors"
              >
                {t("auth.forgotPassword")}
              </a>
            </div>

            {/* Bouton de connexion */}
            <div className="form-control mt-6">
              <button
                className="btn btn-primary btn-block relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-95"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    {t("auth.loggingIn")}
                  </>
                ) : (
                  <>
                    <span>{t("auth.login")}</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Séparateur */}
          <div className="divider text-base-content/40 text-xs">
            {t("auth.or")}
          </div>

          {/* Lien d'inscription */}
          <div className="text-center">
            <p className="text-sm text-base-content/70">
              {t("auth.noAccount")}
              <Link
                to="/register"
                className="link link-primary font-semibold ml-1 hover:underline transition-all"
              >
                {t("auth.register")}
              </Link>
            </p>
          </div>

          {/* Footer décoratif */}
          <div className="mt-4 pt-4 border-t border-base-200 text-center">
            <p className="text-xs text-base-content/50">
              📮 {t("nav.appName")} - {t("auth.secureLogin")}
            </p>
          </div>
        </div>
      </div>

      {/* Styles d'animation personnalisés */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
