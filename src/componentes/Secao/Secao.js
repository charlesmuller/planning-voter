import "./Secao.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState } from "react";

function Secao() {
    const [foiClicado, setFoiClicado] = useState(false);

    const handleClicadoChange = (valor) => {
        setFoiClicado(valor);
    }

    return (
        <div className="secao-main">
            <Menu />
            <div className="secao-content">
                <Botao texto="1" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="2" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="3" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="5" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="8" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="13" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="21" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
            </div>
            <div className="secao-botao-clicado">
                {foiClicado && (
                    <div>
                        O valor de !foiClicado é: {String(foiClicado)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Secao;
