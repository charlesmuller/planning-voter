import React from "react";

function GerarNumero({ gerarStringAleatoria, handleRandomNumber }) {
  return (
    <div>
      <input
        type="text"
        id="id-secao"
        name="secao"
        readOnly
        value={`${gerarStringAleatoria(8)}${Math.floor(Math.random() * 100)}`}
      />
      <button onClick={handleRandomNumber}>Gerar Número</button>
    </div>
  );
}

export default GerarNumero;
