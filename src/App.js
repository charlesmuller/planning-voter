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
  const [randomNumber, setRandomNumber] = useState("");
  const [randomString, setRandomString] = useState("");

  const handleRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 100);
    setRandomNumber(newNumber);
    const newString = gerarStringAleatoria(10);
    setRandomString(newString);
  }

  return (
    <div className='App'>
      <Login />
      <div>
        <input type="text" id="id-secao" name="secao" readOnly value={`${gerarStringAleatoria(8)}${Math.floor(Math.random() * 100)}`} />

        <button onClick={handleRandomNumber}>Gerar Número</button>
      </div>
      <CriarSecao/>
    </div>
  );
}

export default App;
