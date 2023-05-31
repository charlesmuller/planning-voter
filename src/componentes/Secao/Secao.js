import "./Secao.css"
import Menu from "../Menu/Menu"
import Botao from "../Botao/Botao"
import { useState } from "react"

function Secao() {
    const [foiClicado, setFoiClicado] = useState(false)
    const [texto, setTexto] = useState('')

    const handleClicadoChange = (condicao, texto) => {
        console.log('handler secao', condicao, texto)
        setFoiClicado(condicao)
        setTexto(texto)
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
                        O valor é: {String(texto)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Secao;
