import { useQuery, useLazyQuery,useMutation } from "@apollo/client/react";
import { ME_QUERY, MY_TIMBRE_QUERY } from "../graphql/queries";
import { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import qr from "../assets/qr.svg";
import type { MeType, Timbres } from "./types";
import { useTranslation } from "react-i18next";
import { RiEdit2Line } from "react-icons/ri";
import { gql } from "@apollo/client";
import toast from "react-hot-toast";

const CHANGE_FIRST_NAME_MUTATION = gql`
  mutation ChangeFirstName($nom: String!) {
    changeFirstName(nom: $nom) {
      success
      message
    }
  } 
`
const CHANGE_LAST_NAME_MUTATION = gql`
  mutation ChangeLastName($nom: String!) {
    changeLastName(nom: $nom) {
      success
      message
    }
  } 
`
const CHANGE_PASSWORD_MUTATION = gql`
mutation changePassword($newPassword1: String!, $newPassword2: String!,$oldPassword: String!){
  changePassword(newPassword1: $newPassword1, newPassword2: $newPassword2, oldPassword: $oldPassword) {
    errors
    success
    token {
      token
    }
  }
}`
export default function Profil() {
  const {t} = useTranslation();
  const { loading, error, data,refetch } = useQuery<MeType>(ME_QUERY, {
      fetchPolicy: "cache-and-network"
    });
  const [loadTimbre, { called, loading: loading2, data: dataTimbre }] =
    useLazyQuery<Timbres>(MY_TIMBRE_QUERY);
  
  const [changeFirstName, { loading:changingFirstName }] = useMutation(CHANGE_FIRST_NAME_MUTATION);
  const [changeLastName, { loading:changingLastName }] = useMutation(CHANGE_LAST_NAME_MUTATION);
  const [changePassword, { loading:changingPassword }] = useMutation(CHANGE_PASSWORD_MUTATION);


  useEffect(() => {
    loadTimbre();
  });

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 xl:grid-cols-3 bg-base-200 mx-auto gap-4 p-4">
        <div className="card w-96 bg-base-100 shadow-xl p-6">
          <h1 className="text-3xl font-bold mb-4">{t("profil.title")}</h1>
          {loading && (
            <div className="w-20 h-20 flex justify-center items-center m-auto">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          {error && <p className="text-error">{t("common.error")}:<br/> {error.message}</p>}
          {data != undefined && (
            <div>
              <p>
                <strong>{t("auth.username")}:</strong> {data.me.username ?? ""}
              </p>
              <p>
                <strong>{t("profil.firstName")}:</strong> {data.me.firstName ?? "firstname"}
              <button className="btn btn-sm ml-2"  onClick={() => {
                (
                  document.getElementById(
                    "edit_profil",
                  ) as HTMLDialogElement | null
                )?.showModal();
              }}>
                <RiEdit2Line />
              </button>
              </p>
              <p>
                <strong>{t("profil.lastName")}:</strong> {data.me.lastName ?? "lastname"}
                    <button className="btn btn-sm ml-2"  onClick={() => {
                (
                  document.getElementById(
                    "edit_profil",
                  ) as HTMLDialogElement | null
                )?.showModal();
              }}>
                <RiEdit2Line />
              </button>
              </p>
              <p>
                <strong>{t("auth.email")}:</strong> {data.me.email ?? "email"}
              </p>
            </div>  
          )}
          <div className="divider"></div>
          <button className="btn" onClick={() => {
                (
                  document.getElementById(
                    "change_password",
                  ) as HTMLDialogElement | null
                )?.showModal();
              }}>{t("profil.ChangePassword")}</button>
        </div>
        {data != undefined && (
          <div className="card bg-base-100 shadow-xl p-6 xl:col-span-2">
            <h1 className="font-bold text-3xl">{t("profil.myTimbres")}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading2 && (
                <div className="w-20 h-20 flex justify-center items-center m-auto">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              )}
              {called && dataTimbre && dataTimbre.myTimbres.length === 0 && (
                <p className="text-center text-gray-500">
                  {t("profil.noTimbre")}
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
                      <span className="font-semibold text-xl">{t("timbre.reference")}: </span>
                      {timbre.reference}
                    </p>
                    <p>
                      <span className="font-semibold text-xl">{t("timbre.used")}:</span>
                      {timbre.used ? t("timbre.usedYes") : t("timbre.usedNo")}
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
                      {t("profil.timbreLink")}
                    </button>
                    <dialog id={`my_modal_${timbre.id}`} className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">{t("profil.timbreLink")}</h3>
                        <div className="tabs tabs-lift">
                          <label className="tab">
                            <input
                              type="radio"
                              name={`my_tabs_${timbre.id}`}
                              defaultChecked
                            />
                            <img
                              src={qr}
                              alt={t("profil.qrCode")}
                              className="size-4 me-2"
                            />
                            <span className="font-semibold">{t("profil.qrCode")}</span>
                          </label>
                          <div className="tab-content bg-base-100 border-base-300 p-6">
                            <p className="py-4 flex items-center justify-center">
                              <QRCodeCanvas
                                value={`https://swimmer-bullwhip-rearview.ngrok-free.dev/scan/${timbre.qrCode}`}
                                size={256}
                              />
                            </p>
                          </div>
                          <label className="tab">
                            <input type="radio" name={`my_tabs_${timbre.id}`} />
                            <span className="font-mono tracking-tight text-xs mr-0.5">
                              abc
                            </span>
                            <span className="font-semibold">{t("profil.textCode")}</span>
                          </label>
                          <div className="tab-content bg-base-100 border-base-300 p-6">
                            {t("profil.code")}: {timbre.qrCode}
                          </div>
                        </div>
                        <div className="modal-action">
                          <form method="dialog">
                            <button className="btn">{t("profil.close")}</button>
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
<dialog id="edit_profil" className="modal">
  <div className="modal-box">
    <form method="dialog">
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 className="font-bold text-lg">Modification!</h3>
    <div className="py-4 flex flex-col gap-4">
        <form className="flex items-center gap-4" method="dialog" onSubmit={(e)=>{
        e.preventDefault()
        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firt_name")?.toString() ?? "";
        if (firstName === ""){
          toast.error(t("profil.firstNameRequired"))  
          return;
        }
        const toastId = toast.loading(`${t("common.pleaseWait")}`)
        changeFirstName({variables:{"nom":firstName}}).then((res)=>{
          if(res.data?.changeFirstName.success){
            toast.success(res.data.changeFirstName.message,{id:toastId})
            refetch();
          }else{
            toast.success(res.data?.changeFirstName.message,{id:toastId})
          }
        }).catch((err)=>{
          toast.error(err.message,{id:toastId})
        })
      }}>
        <div className="form-control w-full flex items- justify-between gap-4">
          <label className="label">
           <span className="label-text">{t("profil.firstName")}</span>
          </label>
          <input type="text" name="firt_name" required placeholder={t("common.typeHere")} className="input input-bordered w-full max-w-xs" />
             <button type="submit" className="btn btn-outline btn-info btn-ghost">
          {
              changingFirstName ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <RiEdit2Line />
              )
          }
        </button>
        </div>
      </form>
      <form className="flex items-center gap-4" method="dialog" onSubmit={(e)=>{
        e.preventDefault()
         e.preventDefault()
        const formData = new FormData(e.currentTarget);
        const lastName = formData.get("last_name")?.toString() ?? "";
        if (lastName === ""){
          toast.error(t("profil.lastNameRequired"))  
          return;
        } 
        const toastId = toast.loading(`${t("common.pleaseWait")}`)
        changeLastName({variables:{"nom":lastName}}).then((res)=>{
          if(res.data?.changeLastName.success){
            toast.success(res.data.changeLastName.message,{id:toastId})
            refetch();
          }else{
            toast.success(res.data?.changeLastName.message,{id:toastId})
          }
        }).catch((err)=>{
          toast.error(err.message,{id:toastId})
        })
      }}>
        <div className="form-control w-full flex items-center justify-between gap-4">
          <label className="label">
            <span className="label-text">{t("profil.lastName")}</span>
          </label>
          <input type="text" name="last_name" required placeholder={t("common.typeHere")} className="input input-bordered w-full max-w-xs" />
             <button type="submit" className="btn btn-outline btn-info btn-ghost">
            {
              changingLastName ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <RiEdit2Line />
              )
            }
        </button>
        </div>
      </form>
    </div>
  </div>
</dialog>
<dialog id="change_password" className="modal">
            <div className="modal-box">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg">Hello!</h3>
              <div className="py-4">
                <form className="flex flex-col gap-4" method="dialog" onSubmit={(e)=>{
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const oldPassword = formData.get("old_password")?.toString() ?? "";
                  const newPassword1 = formData.get("new_password1")?.toString() ?? "";
                  const newPassword2 = formData.get("new_password2")?.toString() ?? "";
                  if (newPassword1 === "" || newPassword2 === "" || oldPassword === ""){
                    toast.error(t("profil.allFieldsRequired"))
                    return;
                  }
                  if (newPassword1 !== newPassword2){
                    toast.error(t("profil.passwordsDoNotMatch"))
                    return;
                  }
                  const toastId = toast.loading(`${t("common.pleaseWait")}`)
                  changePassword({variables:{oldPassword,newPassword1,newPassword2}}).then((res)=>{
                    if(res.data?.changePassword.success){
                      toast.success(t("profil.passwordChangedSuccessfully"),{id:toastId})
                    }else{
                      toast.error(res.data?.changePassword.errors.join("\n") ?? t("common.error"),{id:toastId})
                    }
                  }).catch((err)=>{
                    toast.error(err.message,{id:toastId})
                  })
                }}>
                  <input type="password" name="old_password" required placeholder={t("auth.oldPassword")} className="input input-bordered w-full" />
                  <input type="password" name="new_password1" required placeholder={t("auth.newPassword1")} className="input input-bordered w-full" />
                  <input type="password" name="new_password2" required placeholder={t("auth.newPassword2")} className="input input-bordered w-full" />
                  <button type="submit" className={`btn ${changingPassword ? "loading" : ""}`}>
                    {t("profil.ChangePassword")}
                    </button>
                </form>
              </div>
            </div>
          </dialog>
    </>
  );
}