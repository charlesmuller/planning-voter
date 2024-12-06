import React, { useState, useEffect } from "react";
import CriarSecao from "./componentes/CriarSecao/CriarSecao";
import Login from "./componentes/Login/Login";
import Secao from "./componentes/Secao/Secao";
import { Routes, Route, useNavigate } from 'react-router-dom'; // Apenas importando as partes necessárias
import Start from "./componentes/Start/Start";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está logado (por exemplo, no localStorage)
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      // Redireciona para login se o usuário não estiver logado
      navigate("/login");
    }
  }, []);

  return (
    <div className='App'>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/criarsecao" element={<CriarSecao />} />
        <Route path="/secao/:idSecao" element={<Secao />} />
      </Routes>
    </div>
  );
}

export default App;
