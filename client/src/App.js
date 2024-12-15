import React from "react";
import CriarSecao from "./componentes/CriarSecao/CriarSecao";
import Login from "./componentes/Login/Login";
import Secao from "./componentes/Secao/Secao";
import { Routes, Route } from 'react-router-dom'; // Apenas importando as partes necessárias

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path="/" element={<CriarSecao />} />
        <Route path="/login" element={<Login />} />
        <Route path="/criarsecao" element={<CriarSecao />} />
        <Route path="/secao/:idSecao" element={<Secao />} />
      </Routes>
    </div>
  );
}

export default App;
