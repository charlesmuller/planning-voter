import React from "react";
import CriarSecao from "./componentes/CriarSecao/CriarSecao";
import Login from "./componentes/Login/Login";
import Secao from "./componentes/Secao/Secao";
import Footer from "./componentes/Footer/Footer";
import { Routes, Route } from 'react-router-dom'; // Apenas importando as partes necessárias

// Limpa chaves antigas do localStorage (formato global pré-login-por-seção)
localStorage.removeItem("usuario");
localStorage.removeItem("tipo");

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path="/" element={<CriarSecao />} />
        <Route path="/login" element={<Login />} />
        <Route path="/criarsecao" element={<CriarSecao />} />
        <Route path="/secao/:idSecao" element={<Secao />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
