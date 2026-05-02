import { Link } from "react-router-dom";

export default function Dashboard({ children }: { children: React.ReactNode }) {
    // const { data } = useQuery(ME_QUERY);

    // const perms = data?.me?.permissions || [];

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
        <li><Link to="/profil">Profil</Link></li>
        <li>
          <a>Authentication</a>
          <ul className="p-2">
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/roles">Gesion des Roles</Link></li> 
          </ul>
        </li>
        <li><Link to="/sessions" >Sessions</Link></li>
      </ul>
    </div>
    <a className="btn btn-ghost text-xl">daisyUI</a>
  </div>
  <div className="navbar-center hidden lg:flex">
    <ul className="menu menu-horizontal px-1">
      {/* <li><Link to="/profil">Profil</Link></li> */}
      <li>
        <details>
          <summary>Authentication</summary>
          <ul className="p-2 bg-base-100 w-40 z-1">
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/roles">Gesion des Roles</Link></li>
          </ul>
        </details>
      </li>
      <li><Link to="/sessions" >Sessions</Link></li>
      <li><Link to="/timbre-type" >Timbre Type</Link></li>
      <li><Link to="/transaction" >Transation</Link></li>
      <li><Link to="/pricing" >Pricing</Link></li>
    </ul>
  </div>
  <div className="navbar-end">
    <Link className="btn-circle btn-soft btn-outline btn-sm btn-info mx-5" to="/profil">Profil</Link>
  </div>
</div>
{children}
    </>
}