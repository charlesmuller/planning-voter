import "./Secao.css"
import Menu from "../Menu/Menu"
import Botao from "../Botao/Botao"
import { useState } from "react"

function Secao() {
    const [foiClicado, setFoiClicado] = useState(false)
    const [texto, setTexto] = useState('')
    const [usuariosAcao, setUsuariosAcao] = useState([])


    const handleClickChange = (mostraTexto, texto) => {
        setFoiClicado(mostraTexto)
        setTexto(texto)
    }

    const handleListaUsuarios = (usuario) => {
        setUsuariosAcao([...usuariosAcao, usuario]);
    }

    return (
        <div className="secao-main">
            <Menu />
            <div className={`secao-content ${foiClicado ? 'secao-expanded' : ''}`}>
                <Botao texto="1" foiClicado={foiClicado} onClickChange={handleClickChange} />
                {/*<Botao texto="2" foiClicado={foiClicado} onClickChange={handleClickChange} />*/}
                {/*<Botao texto="3" foiClicado={foiClicado} onClickChange={handleClickChange} />*/}
                {/*<Botao texto="5" foiClicado={foiClicado} onClickChange={handleClickChange} />*/}
                {/*<Botao texto="8" foiClicado={foiClicado} onClickChange={handleClickChange} />*/}
                {/*<Botao texto="13" foiClicado={foiClicado} onClickChange={handleClickChange} />*/}
                {/*<Botao texto="21" foiClicado={foiClicado} onClickChange={handleClickChange} />*/}
            </div>
            <div className={`secao-botao-clicado ${foiClicado ? 'secao-expanded' : ''}`}>
                {foiClicado && (
                    <div>
                        O valor é: {String(texto)}
                    </div>
                )}
            </div>
            {/*<div className="secao-mostrar">*/}
            {/*    <Botao texto="Mostrar Votos" onClicadoChange={handleClicadoChange} onListaUsuarios={handleListaUsuarios} />*/}
            {/*</div>*/}
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
