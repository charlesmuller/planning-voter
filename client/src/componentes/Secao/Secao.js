import "./Secao.css"
import Menu from "../Menu/Menu"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect } from "react"

function Secao() {
    const [botaoSelecionado, setBotaoSelecionado] = useState(null); // Armazena o texto do botão selecionado
    const [foiClicado, setFoiClicado] = useState(false)
    const [texto, setTexto] = useState('')
    const [usuariosAcao, setUsuariosAcao] = useState([])
    const [votos, setVotos] = useState({}) // Armazena os votos de todos os usuários
    const [usuario, setUsuario] = useState("");

    useEffect(() => {
        // Tenta pegar o nome do usuário do localStorage
        const usuarioLogado = localStorage.getItem("usuario");
        if (usuarioLogado) {
            setUsuario(usuarioLogado);  // Atualiza o estado com o nome do usuário
        }

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
        const novoVoto = { usuario, valor: texto };

        socket.emit('voto', { usuario, valor: novoVoto });

        // Atualiza a lista de usuários que já votaram
        setUsuariosAcao((prev) => [...prev, usuario]);

        setVotos((prev) => ({
            ...prev,
            [usuario]: novoVoto.valor,
        }));
    };

    const handleClickChange = (textoBotao) => {
        console.log(`Botão ${textoBotao}`);

        setBotaoSelecionado(textoBotao); // Atualiza o botão selecionado
        setTexto(textoBotao); // Atualiza o texto a ser exibido
    };


    const handleListaUsuarios = (usuario) => {
        setUsuariosAcao([...usuariosAcao, usuario]);
    }

    return (
        <div className="secao-main">
            <Menu />
            <div className="secao-content">
                {["1", "2", "3", "5", "8", "13", "21"].map((valor) => (
                    <Botao
                        key={valor}
                        texto={valor}
                        foiClicado={botaoSelecionado === valor} // Define se o botão está selecionado
                        onClickChange={() => handleClickChange(valor)} // Passa o valor do botão clicado
                    />
                ))}
            </div>
            <div className="secao-botao-clicado">
                {botaoSelecionado && (
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
