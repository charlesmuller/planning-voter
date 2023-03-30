import React, { useState } from "react";
import CriarSecao from "./componentes/CriarSecao";
import Login from "./componentes/Login";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function gerarStringAleatoria(tamanho) {
  let caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let resultado = '';
  for (let i = 0; i < tamanho; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return resultado;
}

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
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/criarsecao">Criar Seção</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/criarsecao" element={<CriarSecao gerarStringAleatoria={gerarStringAleatoria} gerarNumeroAleatorio={gerarNumeroAleatorio} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;