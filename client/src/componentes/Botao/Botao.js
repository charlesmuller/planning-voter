import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado] = useState(false);

    // Lidar com o clique do botão
    const handleClick = () => {
        if (!props.disabled && props.onClickChange) {
            setFoiClicado(!foiClicado);
            props.onClickChange(!foiClicado, props.texto); // Passa o estado e o texto para o componente pai
        }
        // Caso contrário, o botão age normalmente (para /login)
    };

    return (
            <button
                // className={`botao ${props.className || ''} ${foiClicado ? 'secao-botao-clicado secao-expanded' : ''}`}
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