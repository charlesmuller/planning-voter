import React from "react";
import "../App.css"

function CriarSecao({ gerarStringAleatoria, gerarNumeroAleatorio }) {

    return (
        <div className="secao-container">
            <form>
                <h1>Criar Seção de Planning</h1>
                <div>
                    <label>Sua seção</label>
                    <input
                        type="text"
                        id="id-secao"
                        name="secao"
                        readOnly
                        value={`${gerarStringAleatoria(8)}${Math.floor(Math.random() * 100)}`}
                    />
                </div>

                <button onClick={gerarNumeroAleatorio}>Gerar Número</button>
            </form>
        </div>
    );

}

export default CriarSecao;