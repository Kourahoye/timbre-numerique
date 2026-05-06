import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import  { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import apolloClient from "../apolloClient";
import { Can } from "./can";
import { useNotifications } from "./hooks/useNotification";
import { useAuth } from "./auth";
import LanguageSwitcher from "./languageSeletor";



const LOGOUT = gql`
mutation RevokeToken($refreshToken: String!) {
  logout(refreshToken: $refreshToken) {
    success
    errors
  }
}
`
export default function Dashboard({ children }: { children: React.ReactNode }) {
     const { unreadCount, loading } = useNotifications();
    //  const [me,setMe]  =  useState(localStorage.getItem("me"))
     const [logout] = useMutation(LOGOUT)
     const navigate = useNavigate()
    //  const mode =  localStorage.getItem("mode")
     const {me} = useAuth()
    const logoutfunc = ()=>{
        logout({variables:{refreshToken:localStorage.getItem("refresh")}}).then(()=>{
          localStorage.removeItem("access")
          localStorage.removeItem("refresh")
          // setMe("")
          apolloClient.clearStore()
          navigate("/login")
        })
    }
    

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
          me && <li><Link className="btn btn-circle btn-soft btn-wide btn-outline btn-info uppercase" to="/profil">{me.username}</Link></li>
        }
        <li>
          <a>Authentication</a>
          <ul className="p-2">
            {
              me?.username != "" ? <button type="button" className="btn btn-xs btn-wide btn-error btn-outline btn-ghost" onClick={()=>logoutfunc()} >Logout</button>  :(
                <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
                </>
              )
            }
             <Can permission="manage_users">
                  <li><Link to="/roles">Gesion des Roles</Link></li>
         </Can>
          </ul>
        </li>
      <Can permission="add_session">
      <li><Link to="/sessions" >Sessions</Link></li>
      </Can>
      <Can permission="add_typetimbre">
      <li><Link to="/timbre-type" >Timbre Type</Link></li>
      </Can>
      <Can permission="scan">
      <li><Link to="/scan" >Timbre</Link></li>
      </Can>
      <Can permission="scan">
        <li><Link to="/pricing" >Pricing</Link></li>
      </Can>
      
      <Can permission="">
          <li><Link to="/mytransactions" >Mes transactions</Link></li>
      </Can>
      
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
               me?.username != "" ? <button type="button" className="btn btn-xs btn-wide btn-error btn-outline btn-ghost" onClick={()=>logoutfunc()} >Logout</button>  :(
                <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
                </>
              )
            }
            <Can permission="manage_users">
                  <li><Link to="/roles">Gesion des Roles</Link></li>
         </Can>
          </ul>
        </details>
      </li>
      <Can permission="add_session">
      <li><Link to="/sessions" >Sessions</Link></li>
      </Can>
      <Can permission="add_typetimbre">
      <li><Link to="/timbre-type" >Timbre Type</Link></li>
      </Can>
      <Can permission="scan">
      <li><Link to="/scan" >Consomer Timbre</Link></li>
      </Can>
      <Can permission="scan">
        <li><Link to="/pricing" >Pricing</Link></li>
      </Can>
      
     {
      me &&
          <li><Link to="/mytransactions" >Mes transactions</Link></li>
     }
      
      
     
    </ul>
  </div>
  <div className="navbar-end">
   <label className="toggle text-base-content">
  <input type="checkbox" value="Slate" className="theme-controller" />
  <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>
  <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>
</label>
    <button className="btn btn-ghost btn-circle ml-1">
    <div className="indicator">
       <Link to="/notifications" >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
        <span className={`indicator-item badge badge-xs font-bold text-sm badge-error ${!unreadCount || unreadCount == 0 ? "hidden" :"" }`}>
          {unreadCount  &&
              unreadCount
            }
            {
              loading && <span className="loading loading-spinner loading-xs"></span>
            }
        </span>
      </Link>
    </div>
      </button>

       <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
      <svg className="w-6 h-6 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
    </svg>

        
      </div>
      <ul
        tabIndex={-1}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow space-y-2">
        <li>
           {
            me ? <Link className="btn btn-circle btn-sm btn-soft btn-wide btn-outline btn-info uppercase text-md" to="/profil">{me.username}</Link>
            : <Link to="/login" >Login</Link>
          }
        </li>
        <li>
          <LanguageSwitcher />
        </li>
        <li>
          {me?.username != "" && <button type="button" className="btn btn-xs btn-wide btn-error btn-outline btn-ghost" onClick={()=>logoutfunc()} >Logout</button>}
        </li>
      </ul>
    </div>
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