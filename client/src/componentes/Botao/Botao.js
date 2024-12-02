import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado] = useState(false);

    // Lidar com o clique do botão
    const handleClick = () => {
        if (props.onClickChange) {
            // Se a função onClickChange for passada, chamamos ela (para /secao)
            setFoiClicado(!foiClicado); // Alterna o estado de foiClicado
            props.onClickChange(!foiClicado, props.texto); // Passa o estado e o texto para o componente pai
        }
        // Caso contrário, o botão age normalmente (para /login)
    };

    return (
        <div>
            <button
                className={`botao ${props.foiClicado ? 'secao-botao-clicado secao-expanded' : ''}`}
                type={props.type || "button"}
                onClick={props.onClickChange}
            >
                <span>{props.texto}</span>
            </button>
        </div>

    )
}

export default Botao;