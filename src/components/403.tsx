import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Forbiden() {
  const navigate = useNavigate();
  const [time, setTime] = useState(10);

  useEffect(() => {
    // countdown propre
    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          navigate("/", { replace: true });
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-center px-6">
      {/* Big 404 */}
      <h1 className="text-9xl font-extrabold text-primary drop-shadow-lg">
        403
      </h1>

      <h2 className="text-2xl font-bold mt-4">Acces bolquer</h2>

      <p className="text-gray-500 mt-2 max-w-md">
       Vous n'avez pas le droit d'acceder à cette page
      </p>

      {/* ASCII */}
      <div className="mt-6 text-sm opacity-60 font-mono">
        ┌──────────────────────┐
        <br />
        │ ERROR: ROUTE Forbideen │<br />
        │ STATUS: 403 │<br />
        └──────────────────────┘
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          Retour
        </button>

        <button onClick={() => navigate("/")} className="btn btn-primary">
          Accueil
        </button>
      </div>

      {/* timer */}
      <p className="text-xs text-gray-400 mt-6">
        Redirection automatique dans {time} secondes...
      </p>
    </div>
  );
}
