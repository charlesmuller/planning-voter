import React, { useState } from "react";
import CriarSecao from "./componentes/CriarSecao";
import Login from "./componentes/Login";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Menu from "./componentes/Menu";
import { gerarStringAleatoria } from "./componentes/Utils";
import Start from "./componentes/Start";

function App() {
  const [randomNumber, setNumeroAleatorio] = useState("");
  const [randomString, setStringAleatoria] = useState("");

  const gerarNumeroAleatorio = () => {
    const newNumber = Math.floor(Math.random() * 100);
    setNumeroAleatorio(newNumber);
    const newString = gerarStringAleatoria(10);
    setStringAleatoria(newString);
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <Start/>
        <div className="logo-container-menu">
          <h1>Planning Voter</h1>
        </div>
        <Menu />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/criarsecao" element={<CriarSecao gerarStringAleatoria={gerarStringAleatoria} gerarNumeroAleatorio={gerarNumeroAleatorio} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;