import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { RiRefreshLine } from "react-icons/ri";

const MY_TRANSACTIONS = gql`
  query MY_TRANSACTIONS {
    myTransactions {
      timbre {
       type{
    name
    } price {
        price
      }
        reference
        id
        ownedBy {
          username
        }
      }
   
      controller {
        username
      }
      status
      id
    }
  }
`;
export type TranscList = {
  myTransactions: {
    id: number;
    timbre: {
      price: {
        id: number;
        price: number;
        session: {
          name: string;
        };
        type: {
          name: string;
        };
      };
      qrCode: string;
      reference: string;
      type: {
        name: string;
      };
      used: boolean;
      ownedBy: {
        username: string;
      };
      id: number;
    };
    status: string;
  }[];
};
export default function MyTransactions() {
  const { loading, error, data, refetch } =
    useQuery<TranscList>(MY_TRANSACTIONS);
  return (
    <>
      <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-base-200 w-full">
        {loading && (
          <span className="loading loading-spinner loading-lg"></span>
        )}
        {error && (
          <div role="alert" className="alert alert-error">
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
            <span>{error.message}</span>
            <RiRefreshLine onClick={refetch} />
          </div>
        )}
        {data && data.myTransactions.length == 0 ? <div className="text-xl font-mono text-center">Aucune transaction</div>  : (
          <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-widest uppercase font-semibold">
              Mes Transactions
            </li>

            {data && data.myTransactions.map((transaction) => (
              <li key={transaction.id} className="list-row">
                {/* Avatar / QR icon */}
                <div className="list-col-grow-0">
                  <div className="bg-base-200 rounded-box w-10 h-10 flex items-center justify-center text-lg">
                    🔖
                  </div>
                </div>

                {/* Infos principales */}
                <div className="list-col-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {transaction.timbre.reference}
                    </span>
                    <span
                      className={`badge badge-sm ${
                        transaction.status === "accepted"
                          ? "badge-success"
                          : transaction.status === "pending"
                            ? "badge-warning"
                            : "badge-error"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>

                  <div className="text-sm opacity-60 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span>
                      Type :{" "}
                      <strong>{transaction.timbre.type?.name ?? "—"}</strong>
                    </span>
                    <span>
                      Propriétaire :{" "}
                      <strong>
                        {transaction.timbre.ownedBy?.username ?? "—"}
                      </strong>
                    </span>
                    <span>
                      Montant :{" "}
                      <strong>
                        {transaction.timbre.price
                          ? `${transaction.timbre.price.price}`
                          : "—"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Statut utilisé */}
                <div className="list-col-grow-0 flex flex-col items-center gap-1">
                  {transaction.timbre.used ? (
                    <span
                      className="status status-error status-lg"
                      aria-label="Utilisé"
                    />
                  ) : (
                    <span
                      className="status status-success status-lg"
                      aria-label="Disponible"
                    />
                  )}
                  <span className="text-xs opacity-50">
                    {transaction.timbre.used ? "Utilisé" : "Dispo"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
