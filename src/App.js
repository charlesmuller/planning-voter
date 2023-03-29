import React, { useState } from "react";
import CriarSecao from "./CriarSecao";
import Login from "./Login";


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
    <div className='App'>
      <Login />

      <CriarSecao gerarStringAleatoria={gerarStringAleatoria} gerarNumeroAleatorio={gerarNumeroAleatorio} />
    </div>
  );
}

export default App;