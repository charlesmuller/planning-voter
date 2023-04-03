import React from "react";
import "../App.css"
import Menu from "./Menu";

function CriarSecao({ gerarStringAleatoria, gerarNumeroAleatorio }) {
    return (
        <div>
            <Menu/>
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

                    <button onClick={gerarNumeroAleatorio}>Gerar link de Seção</button>
                </form>
            </div>
        </div>
    );

}

export default CriarSecao;