import "./Secao.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState } from "react";

function Secao() {
    const [botaoClicado, setBotaoClicado] = useState([])

    const adicionarBotaoClicado = (texto) => {
        console.log(!botaoClicado, 'foi clicado')

        setBotaoClicado([...botaoClicado, texto])
    }

    return (
        <div className="secao-main">
            <Menu />
            <div className="secao-content">
                <Botao texto="1" onClick={() => adicionarBotaoClicado("1")} />
                <Botao texto="2" />
                <Botao texto="3" />
                <Botao texto="5" />
                <Botao texto="8" />
                <Botao texto="13" />
                <Botao texto="21" />
            </div>
            <div className="secao-botao-clicado">
                {botaoClicado.map((texto, index) => (
                    <span key={index}>{texto}</span>
                ))}
            </div>
        </div>
    )
}

export default Secao;