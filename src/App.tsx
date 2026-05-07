import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/home";
import { ApolloProvider } from "@apollo/client/react";
import Login from "./components/login";
import Register from "./components/register";
import apolloClient from "./apolloClient";
import Profil from "./components/profil";
import TypeTimbre from "./components/typeTimbre";
import Dashboard from "./components/dashbord";
import ProtectedRoute from "./services/guard";
import NotFound from "./components/404";
import Roles from "./components/roles";
import Session from "./components/session";
import Price from "./components/pricing";
import Notifications from "./components/notifications";
import Forbiden from "./components/403";
import FindTransaction from "./components/findTransaction";
import Transaction from "./components/transaction";
import MyTransactions from "./components/myTransactions";
import { AuthProvider } from "./components/auth";
import DashboardInfo from "./components/dashboard";

function App() {
  return (
    <>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>

        <Dashboard>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan/:qr"
              element={
                <ProtectedRoute permission="timbre.view_timbre">
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan"
              element={
                <ProtectedRoute permission="timbre.view_timbre">
                  <Transaction />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/scan" element={<QRScanner />} /> */}
            <Route
              path="/timbre-type"
              element={
                <ProtectedRoute>
                  <TypeTimbre />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Forbiden />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/404" element={<NotFound />} />
            <Route
              path="/roles"
              element={
                <ProtectedRoute permission="manage_users">
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute permission="add_session">
                  <Session />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing"
              element={
                <ProtectedRoute permission="" >
                  <Price />
                </ProtectedRoute>
              }
              />
              <Route 
                path="/notifications"
                element={
                  <ProtectedRoute permission="">
                    <Notifications />
                  </ProtectedRoute>
                }
                />
              <Route
              path="/pricing"
              element={
                <ProtectedRoute permission="">
                <Price />
                </ProtectedRoute>
              }
              />
              <Route 
                path="/transaction/:idTranction"
                element={
                  <ProtectedRoute permission="">
                    <FindTransaction />
                  </ProtectedRoute>
                }
                /> <Route 
                path="/transaction"
                element={
                  <ProtectedRoute permission="">
                    <FindTransaction />
                  </ProtectedRoute>
                }
                /> 
                <Route 
                path="/mytransactions"
                element={
                <ProtectedRoute permission="">
                    <MyTransactions />
                </ProtectedRoute>
                }
                />
                <Route 
                path="/dashboard"
                element={
                <ProtectedRoute permission="">
                    <DashboardInfo />
                </ProtectedRoute>
                }
                />
          </Routes>
        </Dashboard>
          </AuthProvider>
      </ApolloProvider>
    </>
  );
}

export default App;
