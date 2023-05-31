import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado, texto] = useState(false);

    const handleClick = () => {
        const condicao = !foiClicado
        // console.log('!foiClicado',!foiClicado, props.texto)
        setFoiClicado(condicao, props.texto)
        // console.log('setfoiclicado', novoValor)
        props.onClicadoChange(condicao, props.texto)
        // console.log('props.onClicadoChange', novoValor, props.texto)
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