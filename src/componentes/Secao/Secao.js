import "./Secao.css"
import Menu from "../Menu/Menu"
import Botao from "../Botao/Botao"
import { useState } from "react"

function Secao() {
    const [foiClicado, setFoiClicado] = useState(false)
    const [texto, setTexto] = useState('')
    const [usuariosAcao, setUsuariosAcao] = useState([])


    const handleClicadoChange = (condicao, texto) => {
        setFoiClicado(condicao)
        setTexto(texto)
    }

    const handleListaUsuarios = (usuario) => {
        setUsuariosAcao([...usuariosAcao, usuario]);
    }

    return (
        <div className="secao-main">
            <Menu />
            <div className={`secao-content ${foiClicado ? 'secao-expanded' : ''}`}>
                <Botao texto="1" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="2" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="3" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="5" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="8" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="13" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
                <Botao texto="21" foiClicado={foiClicado} onClicadoChange={handleClicadoChange} />
            </div>
            <div className={`secao-botao-clicado ${foiClicado ? 'secao-expanded' : ''}`}>
                {foiClicado && (
                    <div>
                        O valor é: {String(texto)}
                    </div>
                )}
            </div>
            <div className="secao-mostrar">
                <Botao texto="Mostrar Votos" onClicadoChange={handleClicadoChange} onListaUsuarios={handleListaUsuarios} />
            </div>
            <div className="secao-votos">
                {usuariosAcao.length > 0 && (
                    <div>
                        Usuários que realizaram a ação:
                        <ul>
                            {usuariosAcao.map((usuario, index) => (
                                <li key={index}>{usuario}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Secao;
