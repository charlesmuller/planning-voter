import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado, texto] = useState(false);

    const handleClick = () => {
        const condicao = !foiClicado
        setFoiClicado(condicao, props.texto)
        console.log(props.texto)
        props.onClicadoChange(condicao, props.texto)
        props.onListaUsuarios(props.texto)
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

export default Botao;