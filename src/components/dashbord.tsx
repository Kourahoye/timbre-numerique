import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useEffect } from "react";
import  { Toaster } from "react-hot-toast";
import { RiNotification4Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const GET_NOTIFS =gql`
  query GET_NOTIFS {
  newNotisCount
}
`

export default function Dashboard({ children }: { children: React.ReactNode }) {
     const [loadNotifs, {data}] = useLazyQuery<{newNotisCount:number}>(GET_NOTIFS);
     const me  =  localStorage.getItem("me")
    //  const mode =  localStorage.getItem("mode")
    useEffect(() => {

      const interval = setInterval(() => {
        loadNotifs()
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);

    return <>
    <div className="navbar bg-base-100 shadow-sm">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
      </div>
      <ul
        tabIndex={-1}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        {
          me && <li><Link className="btn btn-circle btn-soft btn-wide btn-outline btn-info uppercase" to="/profil">{me}</Link></li>
        }
        <li>
          <a>Authentication</a>
          <ul className="p-2">
            {
              me == "" || me==null &&(
                <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
                </>
              )
            }
            <li><Link to="/roles">Gesion des Roles</Link></li> 
          </ul>
        </li>
        <li><Link to="/sessions" >Sessions</Link></li>
      <li><Link to="/timbre-type" >Timbre Type</Link></li>
      <li><Link to="/scan" >Timbre</Link></li>
      <li><Link to="/pricing" >Pricing</Link></li>
      <li className="divider h-1"></li>
     <li>
         <label className="swap swap-rotate">
          Theme
       <input type="checkbox" className="theme-controller" value="Slate" />
       <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
       <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
      </label>
     </li>
      </ul>
    </div>
    <Link className="btn btn-ghost text-xl font-mono" to="/">Timbre Numerique</Link>
  </div>
  <div className="navbar-center hidden lg:flex">
    <ul className="menu menu-horizontal px-1">
      {/* <li><Link to="/profil">Profil</Link></li> */}
      <li>
        <details>
          <summary>Authentication</summary>
          <ul className="p-2 bg-base-100 w-40 z-1">
             {
              me == "" || me==null &&(
                <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
                </>
              )
            }
            <li><Link to="/roles">Gesion des Roles</Link></li>
          </ul>
        </details>
      </li>
      <li><Link to="/sessions" >Sessions</Link></li>
      <li><Link to="/timbre-type" >Timbre Type</Link></li>
      <li><Link to="/scan" >Timbre</Link></li>
      <li><Link to="/pricing" >Pricing</Link></li>
     
    </ul>
  </div>
  <div className="navbar-end">
    <label className="not-lg:hidden swap swap-rotate">
      {/* this hidden checkbox controls the state */}
      <input type="checkbox" className="theme-controller" value="dark" />
      {/* sun icon */}
      <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
      {/* moon icon */}
      <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
    </label>
    <div className="indicator">
      {data && data.newNotisCount.toString() != "0" &&
      <span className="indicator-item badge badge-xs font-bold text-sm badge-error">
        {data.newNotisCount.toString()}
      </span>
        }
       <Link to="/notifications" >
        <RiNotification4Fill className="btn btn-sm btn-ghost" />
      </Link>
    </div>
    {
      me ? <Link className="btn btn-circle btn-soft btn-outline btn-info mx-5 uppercase p-7 text-lg" to="/profil">{me[0]}</Link>
      : <Link to="/login" >Login</Link>
    }
  </div>
</div>
{children}
<Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="" //the toast all the screen
        toasterId="default"
        toastOptions={{
          // Define default options
          className: "card shadow shadow-slate-950 ring ring-red-600 bg-white",
          duration: 3000,
          removeDelay: 3000,
          style: {
            background: "#FFFFFFFF",
            color: "#000000",
          },

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </>
}