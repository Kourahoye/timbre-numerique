import { Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./components/home";
import { ApolloProvider } from "@apollo/client/react";
import Login from "./components/login";
import Register from "./components/register";
import apolloClient from "./apolloClient";
import Profil from "./components/profil";
import Transaction from "./components/transaction";
import QRScanner from "./components/scanner";
import TypeTimbre from "./components/typeTimbre";

function App() {


  return (
    <>
    <ApolloProvider client={apolloClient}>
  <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/transaction/:qr" element={<Transaction />} />
      <Route path="/scan" element={<QRScanner />} />
      <Route path="/add-type" element={<TypeTimbre />} />
    </Routes>
    </ApolloProvider>
    </>
  )
}

export default App
