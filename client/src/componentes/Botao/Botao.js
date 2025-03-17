import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado] = useState(false);

    // Lidar com o clique do botão
    const handleClick = (e) => {
        if (props.type !== "submit") {
            e.preventDefault(); // Impede apenas se o botão não for submit
        }

        if (!props.disabled && props.onClickChange) {
            setFoiClicado(!foiClicado);
            props.onClickChange(!foiClicado, props.texto); // Passa o estado e o texto para o componente pai
        }
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