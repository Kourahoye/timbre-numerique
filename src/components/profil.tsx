import { useQuery, useLazyQuery } from "@apollo/client/react";
import { ME_QUERY, MY_TIMBRE_QUERY } from "../graphql/queries";
import { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import qr from "../assets/qr.svg";
import type { MeType, Timbres } from "./types";
export default function Profil() {
  const { loading, error, data } = useQuery<MeType>(ME_QUERY);
  const [loadTimbre, { called, loading: loading2, data: dataTimbre }] =
    useLazyQuery<Timbres>(MY_TIMBRE_QUERY);

  useEffect(() => {
    loadTimbre();
  });

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 xl:grid-cols-3 bg-base-200 mx-auto gap-4 p-4">
        <div className="card w-96 bg-base-100 shadow-xl p-6">
          <h1 className="text-3xl font-bold mb-4">Profil</h1>
          {loading && (
            <div className="w-20 h-20 flex justify-center items-center m-auto">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          {error && <p className="text-error">Error: {error.message}</p>}
          {data != undefined && (
            <div>
              <p>
                <strong>Username:</strong> {data.me.username ?? ""}
              </p>
              <p>
                <strong>First Name:</strong> {data.me.firstName ?? "firstname"}
              </p>
              <p>
                <strong>Last Name:</strong> {data.me.lastName ?? "lastname"}
              </p>
              <p>
                <strong>Email:</strong> {data.me.email ?? "email"}
              </p>
            </div>
          )}
        </div>
        {data != undefined && (
          <div className="card bg-base-100 shadow-xl p-6 xl:col-span-2">
            <h1 className="font-bold text-3xl">LIST DES TIMBRES</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading2 && (
                <div className="w-20 h-20 flex justify-center items-center m-auto">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              )}
              {called && dataTimbre && dataTimbre.myTimbres.length === 0 && (
                <p className="text-center text-gray-500">
                  Aucun timbre trouvé.
                </p>
              )}
              {dataTimbre &&
                dataTimbre.myTimbres.length > 0 &&
                dataTimbre.myTimbres.map((timbre) => (
                  <div
                    key={timbre.id}
                    className="card w-96 bg-base-100 shadow-xl p-6"
                  >
                    <h2 className="text-2l font-bold mb-2">
                      {timbre.type.name}
                    </h2>
                    <p>
                      <span className="font-semibold text-xl">Reference: </span>
                      {timbre.reference}
                    </p>
                    <p>
                      <span className="font-semibold text-xl">Used:</span>{" "}
                      {timbre.used ? "Yes" : "No"}
                    </p>
                    <button
                      className="btn"
                      onClick={() => {
                        (
                          document.getElementById(
                            `my_modal_${timbre.id}`,
                          ) as HTMLDialogElement | null
                        )?.showModal();
                      }}
                    >
                      Link
                    </button>
                    <dialog id={`my_modal_${timbre.id}`} className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">Lien du timbre!</h3>
                        <div className="tabs tabs-lift">
                          <label className="tab">
                            <input
                              type="radio"
                              name={`my_tabs_${timbre.id}`}
                              defaultChecked
                            />
                            <img
                              src={qr}
                              alt="qr code"
                              className="size-4 me-2"
                            />
                            <span className="font-semibold">QrCode</span>
                          </label>
                          <div className="tab-content bg-base-100 border-base-300 p-6">
                            <p className="py-4 flex items-center justify-center">
                              {" "}
                              <QRCodeCanvas
                                value={`https://swimmer-bullwhip-rearview.ngrok-free.dev/transaction/${timbre.qrCode}`}
                                size={256}
                              />
                            </p>
                          </div>
                          <label className="tab">
                            <input type="radio" name={`my_tabs_${timbre.id}`} />
                            <span className="font-mono tracking-tight text-xs mr-0.5">
                              abc
                            </span>
                            <span className="font-semibold">Text Code</span>
                          </label>
                          <div className="tab-content bg-base-100 border-base-300 p-6">
                            Code: {timbre.qrCode}
                          </div>
                        </div>
                        <div className="modal-action">
                          <form method="dialog">
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
