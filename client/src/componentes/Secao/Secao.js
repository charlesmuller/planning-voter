import "./Secao.css"
import Menu from "../Menu/Menu"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom";

function Secao() {
    const [botaoSelecionado, setBotaoSelecionado] = useState(null); // Armazena o texto do botão selecionado
    const [foiClicado, setFoiClicado] = useState(false)
    const [texto, setTexto] = useState('')
    const [usuariosAcao, setUsuariosAcao] = useState([])
    const [votos, setVotos] = useState({}) // Armazena os votos de todos os usuários
    const [usuario, setUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]); // Lista de usuários logados
    const [mostrarVotos, setMostrarVotos] = useState(false); // Controla a exibição dos votos
    const todosVotaram = usuarios.every((user) => votos[user]);
    const [mostrarVotosClicado, setMostrarVotosClicado] = useState(false);
    const { idSecao } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        const usuarioLogado = localStorage.getItem("usuario");
        console.log("Usuário logado:", usuarioLogado);
        console.log("ID da seção:", idSecao);
        if (!usuarioLogado || usuarioLogado.trim() === "") {
            console.log("Redirecionando para login por falta de usuário logado...");
            navigate("/login", { state: { idSecao } });
            return; // Evita executar o restante do código no efeito
        }


        if (idSecao && usuarioLogado) {
            // Enviar evento de login ao servidor
            setUsuario(usuarioLogado);
            socket.emit('usuarioLogado', { usuario: usuarioLogado, idSecao: idSecao });

            // Atualiza lista de usuários logados
            socket.on("usuariosLogados", (usuariosLogados) => {
                setUsuarios([...new Set(usuariosLogados)]);
            });

            // Atualiza os votos em tempo real
            socket.on("atualizarVotos", (votosRecebidos) => {
                console.log("Votos recebidos do servidor atualizarVotos 46:", votosRecebidos);
                setVotos(votosRecebidos); // Atualiza os votos no estado local
            });
        } else {
            alert("Seção inválida ou não encontrada!");
            navigate("/");
        }

        // Recebe votos do servidor
        socket.on("receberVotos", (votosRecebidos) => {
            console.log("Votos recebidos do servidor: receberVotos 56", votosRecebidos);
            setVotos(votosRecebidos);
        });

        socket.on("mostrarVotos", (votosRecebidos) => {
            console.log("Votos recebidos do servidor: mostrarVotos 61", votosRecebidos); // Debug
            setVotos(votosRecebidos); // Atualiza os votos com os recebidos do servidor
            setMostrarVotos(true); // Atualiza para mostrar os votos
        });

        socket.on("resetarRodada", () => {
            console.log("Recebido evento 'resetarRodada' do servidor");
            setBotaoSelecionado(null); // Remove a seleção do botão
            setMostrarVotos(false);    // Oculta os votos
        });

        
        const checkSecaoExistente = async () => {
            const response = await fetch(`/secao/${idSecao}`);
            const data = await response.json();
            if (!data.valida) {
                navigate("/criarsecao");
            }
        };

        checkSecaoExistente();
        
        return () => {
            socket.off("atualizarVotos");
            socket.off("receberVotos");
            socket.off("usuariosLogados");
            socket.off("mostrarVotos");
            socket.off("resetarEstado");
        };
    }, [idSecao, navigate]);


    const handleVotacao = (textoBotao) => {
        // Envia o voto para o servidor
        if (!usuario) {
            console.error("Nenhum usuário logado encontrado!");
            return;
        }
        const novoVoto = { usuario, valor: textoBotao, idSecao };
        console.log(`dados do voto antes de enviar ${JSON.stringify(novoVoto)}`);
        socket.emit('voto', novoVoto); // Envia o voto para o servidor


        // Atualiza localmente os votos
        setVotos((prev) => ({
            ...prev,
            [usuario]: textoBotao,
        }));

        console.log(`Voto enviado: ${JSON.stringify(novoVoto)}`);
    };

    const handleClickChange = (textoBotao) => {
        setBotaoSelecionado(textoBotao); // Atualiza o botão selecionado
        setTexto(textoBotao); // Atualiza o texto a ser exibido
        handleVotacao(textoBotao); // Envia o voto
    };

    const handleMostrarVotos = () => {
        console.log("Emitindo evento 'pedirVotos' para o servidor");

        console.log("dados no mostrarvotos:", usuario, idSecao, votos);
        socket.emit("pedirVotos", { usuario, idSecao, votos });


        setMostrarVotos(true); // Atualiza o estado para exibir os votos
        setMostrarVotosClicado(true); // Marca o botão como clicado
    };

    const handleNovaRodada = () => {
        // Emite o evento para o servidor iniciar a nova rodada
        console.log("idSecao no novaRodada", idSecao);

        socket.emit("novaRodada", { idSecao, votos });

        // Atualiza o estado local para refletir imediatamente no cliente
        setVotos({});
        setBotaoSelecionado(null);
        setMostrarVotos(false);

        console.log("Nova rodada iniciada, votos resetados localmente.");
    };


    const handleSair = () => {
        if (!usuario) {
            console.error("Nenhum usuário logado encontrado!");
            return;
        }

        // Emite o evento para o servidor para remover o usuário da lista de logados
        socket.emit("sair", { usuario });

        // Limpa o usuário do estado local
        localStorage.removeItem("usuario");
        setUsuario(""); // Atualiza o estado do usuário para vazio

        // Redireciona para a página de login usando useNavigate
        navigate("/criarsecao"); // Substitua "/login" pela rota que deseja redirecionar
    };

    return (
        <div className="secao-main">
            <div>Seção ID: {idSecao}</div>;
            <Menu />
            <Botao
                texto="Sair"
                onClickChange={handleSair}
            />
            <Botao
                texto="Nova Rodada"
                onClickChange={handleNovaRodada}
                className="nova-rodada" // Classe adicional para estilização, se necessário
            />

            <div className="usuarios-logados">
                <h1>Bem-vindo, {usuario}</h1>
                <h2>Usuários Logados:</h2>
                <ul>
                    {usuarios.map((user, index) => (
                        <li key={index}>
                            {user}
                            <span>
                                {votos[user] ? " -> [votou]" : " -> [não votou]"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="secao-content">
                {["1", "2", "3", "5", "8", "13", "21"].map((valor) => (
                    <Botao
                        key={valor}
                        texto={valor}
                        foiClicado={botaoSelecionado === valor}
                        onClickChange={() => handleClickChange(valor)}
                        className={botaoSelecionado === valor ? 'secao-botao-clicado secao-expanded' : ''}
                    />
                ))}
            </div>
            <div className="secao-mostrar">
                <Botao
                    texto="Mostrar Votos"
                    onClickChange={handleMostrarVotos}
                    disabled={!todosVotaram}
                    className="mostrar-votos" // Classe adicional
                />
            </div>

            <div className="secao-votos">

                {mostrarVotos && Object.keys(votos).length > 0 && (
                    <div>
                        <h3>Votos dos Usuários:</h3>
                        <ul>
                            {usuarios.map((user, index) => (
                                <li key={index}>
                                    {user}: {votos[user] || "Ainda não votou"}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Secao;
