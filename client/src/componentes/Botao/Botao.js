import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado] = useState(false);
    const handleClick = () => {
        if (!props.disabled && props.onClickChange) {
            setFoiClicado(!foiClicado);
            props.onClickChange(!foiClicado, props.texto);
        }
    };

    return (
        <button
            className={`botao ${props.className || ''} ${foiClicado ? 'clicado' : ''}`}
            type={props.type || "button"}
            onClick={handleClick}
            disabled={props.disabled}
        >
            <span>{props.texto}</span>
        </button>
    )
}

export default Botao;