import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado] = useState(false);

    const handleClick = () => {
        const novoValor = !foiClicado;
        setFoiClicado(novoValor);
        props.onClicadoChange(novoValor);
    }

    return (
        <button
            className={`botao ${foiClicado ? 'foiClicado' : ''}`}
            onClick={handleClick}
        >
            <span>{props.texto}</span>
        </button>
    )
}

export default Botao