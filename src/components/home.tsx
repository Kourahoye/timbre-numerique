import { gql } from "@apollo/client";
// import QrCode from "./qrcode";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import { RiErrorWarningLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SessionType } from "./types";
import DjomyPaymentModal from "./payment";
import home from "../assets/home.png";

const GET_TYPE = gql`
  query data {
    timbreType {
      id
      name
    }
  }
`;

const GET_TIMBRE_PRICE = gql`
  query GET_TIMBRE_PRICE($id: Int!) {
    getTimbrePrice(id: $id) {
      price
      session {
        name
      }
    }
  }
`;

export type TimbreType = {
  timbreType: {
    id: number;
    name: string;
  }[];
};

export type timbreTYpes = {
  getTimbrePrice: {
    price: number;
    session: SessionType;
  };
};

function Home() {
  const {
    loading: loadingType,
    error: errortype,
    data: types,
    refetch: refetchType,
  } = useQuery<TimbreType>(GET_TYPE, {
    fetchPolicy: "cache-and-network",
  });
  const [getPrice, { loading: loadingPrice, data }] =
    useLazyQuery<timbreTYpes>(GET_TIMBRE_PRICE);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const { t } = useTranslation();

  return (
    <>
      <div className="max-w-6xl mx-auto mb-10 p-4">
        {/* Bannière principale avec image */}
        <div className="card bg-base-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <figure className="relative overflow-hidden">
            <img
              src={home}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              alt="Timbre numérique"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
          </figure>
          <div className="card-body">
            <h2 className="card-title text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("nav.appName")}
            </h2>

            <p className="text-lg text-base-content/80 leading-relaxed">
              {t("common.simplifySteps")}
            </p>

            {/* Grille des avantages */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 backdrop-blur-sm">
              <div className="text-2xl">⚡</div>
              <div className="text-sm font-medium">{t("common.quickPurchase")}</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 backdrop-blur-sm">
              <div className="text-2xl">🔒</div>
              <div className="text-sm font-medium">{t("common.securePayment")}</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 backdrop-blur-sm">
              <div className="text-2xl">📱</div>
              <div className="text-sm font-medium">{t("common.mobileCompatible")}</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 backdrop-blur-sm">
              <div className="text-2xl">✅</div>
              <div className="text-sm font-medium">{t("common.qrVerification")}</div>
            </div>
          </div> */}

            {/* Comment ça marche */}
            {/* <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
              <span className="text-2xl">📖</span>
              {t("common.howItWorks")}
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="badge badge-primary badge-sm">1</span>
                {t("common.selectStampType")}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="badge badge-primary badge-sm">2</span>
                {t("common.checkAmount")}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="badge badge-primary badge-sm">3</span>
                {t("common.securePayment")}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="badge badge-primary badge-sm">4</span>
                {t("common.receiveStamp")}
              </li>
              <li className="flex items-center gap-2 text-sm md:col-span-2">
                <span className="badge badge-primary badge-sm">5</span>
                {t("common.presentQRCode")}
              </li>
            </ul>
          </div> */}
          </div>
        </div>

        <div className="divider my-8">
          <span className="text-base-content/40 text-sm">✨</span>
        </div>

        {/* Section d'achat */}
        <div className="hero min-h-100 rounded-xl bg-linear-to-br from-base-200 to-base-100 shadow-xl overflow-hidden">
          <div className="hero-content text-center p-8">
            <div className="w-full max-w-md">
              <h1 className="text-4xl font-bold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("common.getYours")}
              </h1>

              <form
                method="post"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                {/* Sélection du type de timbre */}
                <div className="form-control w-full">
                  <label className="label" htmlFor="type">
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
                          d="M3 10h18M6 19h12M6 5h12M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z"
                        />
                      </svg>
                      {t("timbre.type")}
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      required
                      className="select select-bordered select-primary w-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      defaultValue={"default"}
                      id="type"
                      onChange={(e) => {
                        const selectedId = Number.parseInt(e.target.value, 10);
                        setSelectedTypeId(selectedId);
                        getPrice({
                          variables: { id: selectedId },
                        }).catch((error) => {
                          if (
                            error.message.includes("Authentication required")
                          ) {
                            toast.error(`${t("common.loginRequired")}`);
                            return;
                          } else if (error.message.includes("does not exist")) {
                            toast.error(`${t("pricing.noPriceYear")}`);
                            return;
                          }
                          toast.error(error.message);
                        });
                      }}
                    >
                      <option disabled value={"default"}>
                        {t("timbre.pickTimbreType")}
                      </option>
                      {types &&
                        types.timbreType.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                    </select>
                    {loadingType && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    )}
                    {errortype && (
                      <button
                        type="button"
                        onClick={() => refetchType()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-error hover:text-error/80 transition-colors"
                      >
                        <RiErrorWarningLine className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Affichage du prix */}
                {/* <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("timbre.amountToPay")}
                  </span>
                  {/* <div className="flex items-center gap-2">
                    {loadingPrice ? (
                      <span className="loading loading-spinner loading-md"></span>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {data?.getTimbrePrice?.price || 0} FCFA
                      </span>
                    )}
                  </div> */}
                {/* </div>
              </div> */}

                {/* Bouton d'achat */}
                {types && data && selectedTypeId ? (
                  <DjomyPaymentModal
                    amount={data?.getTimbrePrice.price || 0}
                    description=""
                    typeTimbre={
                      types?.timbreType.find(
                        (item) =>
                          item.id ===
                          Number.parseInt(selectedTypeId?.toString() || "0"),
                      )?.name
                    }
                    type={Number.parseInt(selectedTypeId?.toString() || "0")}
                  />
                ) : (
                  <button
                    className="btn btn-primary btn-block relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    disabled={!selectedTypeId}
                  >
                    <span>{t("timbre.buy")}</span>
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M18 13l1.5 6M9 21h6M12 21v-8"
                      />
                    </svg>
                  </button>
                )}
              </form>

              {/* QR Code décoratif */}
              {/* <div className="mt-8 pt-6 border-t border-base-200">
              <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity duration-300">
                <QrCode />
              </div>
              <p className="text-xs text-base-content/50 mt-2">
                {t("common.qrCodeInfo")}
              </p>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
