import "./Secao.css"
import Menu from "../Menu/Menu"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect} from "react"

function Secao() {
    const [foiClicado, setFoiClicado] = useState(false)
    const [texto, setTexto] = useState('')
    const [usuariosAcao, setUsuariosAcao] = useState([])
    const [votos, setVotos] = useState({}) // Armazena os votos de todos os usuários
    const [usuario, setUsuario] = useState("Usuário1"); // Defina um nome para o usuário, pode ser dinâmico

    useEffect(() => {
        socket.on('voto', (voto) => {
            // Adiciona os votos recebidos à lista de votos
            setUsuariosAcao(prevState => [...prevState, voto.usuario]);
            console.log(`Voto de ${voto.usuario}: ${voto.valor}`);
        });
    
        // Limpar o evento ao desmontar o componente
        return () => {
            socket.off('voto');
        };
    }, []);

    const handleVotacao = () => {
        // Envia o voto para o servidor
        const usuario = 'UsuarioX'; // Aqui você pode pegar o nome do usuário de algum lugar
        socket.emit('voto', { usuario, valor: texto });

        // Atualiza a lista de usuários que já votaram
        setUsuariosAcao((prev) => [...prev, usuario]);
    };

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
                <Botao texto="2" foiClicado={foiClicado} onClickChange={handleClickChange} />
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
            {/* <div className="secao-mostrar">
               <Botao texto="Mostrar Votos" onClicadoChange={handleClcadoChange} onListaUsuarios={handleListaUsuarios} />
            </div> */}
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
