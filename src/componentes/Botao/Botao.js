import './Botao.css';
import React, { useState } from "react";

const Botao = (props) => {
    const [foiClicado, setFoiClicado, texto] = useState(false);
    const [clickedButton, setClickedButton] = useState(null);

    const handleClickButton = (buttonIndex) => {
        setClickedButton(buttonIndex)
        const mostraTexto = !foiClicado
        setFoiClicado(mostraTexto, props.texto)
        props.onClickChange(mostraTexto, props.texto)
    };

    const botoes = [
        "Button 1",
        "Button 2",
        "Button 3",
        "Button 4",
        "Button 5"
    ];

    const handleClick = () => {
        const mostraTexto = !foiClicado
        setFoiClicado(mostraTexto, props.texto)
        props.onClickChange(mostraTexto, props.texto)
        // props.onListaUsuarios(props.texto)
    }

    return (
        <div>
            {/*{botoes.map((buttonText, index) => (*/}
            {/*    <button*/}
            {/*        key={index}*/}
            {/*        className={`custom-button ${clickedButton === index ? "clicked" : ""}`}*/}
            {/*        onClick={() => handleClickButton(index)}*/}
            {/*    >*/}
            {/*        {buttonText}*/}
            {/*    </button>*/}
            {/*))}*/}
            <button
                className={`botao ${foiClicado ? 'foiClicado' : ''}`}
                onClick={handleClick}
            >
                <span>{props.texto}</span>
            </button>
        </div>

    )
}

export default Botao;