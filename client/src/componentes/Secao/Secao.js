import "./Secao.css"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";

function Secao() {
    const [botaoSelecionado, setBotaoSelecionado] = useState(null); // Armazena o texto do botão selecionado
    const [, setTexto] = useState('');
    const [votos, setVotos] = useState({});
    const [usuario, setUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]); // Lista de usuários logados
    const [mostrarVotos, setMostrarVotos] = useState(false); // Controla a exibição dos votos
    const todosVotaram = usuarios.every((user) => votos[user]);
    const [, setMostrarVotosClicado] = useState(false);
    const { idSecao } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioLogado = localStorage.getItem("usuario");

        if (!usuarioLogado || usuarioLogado.trim() === "") {
            navigate("/login", { state: { idSecao } });
            return;
        }

        if (idSecao && usuarioLogado) {
            // Define o usuário no estado
            setUsuario(usuarioLogado);
console.log('idSecao no front-> ', idSecao);
            // Envia o evento de login para a seção correta
            socket.emit('usuarioLogado', { usuario: usuarioLogado, idSecao });

            // Escuta o evento "usuariosLogados" e atualiza somente os usuários da seção atual
            socket.on("usuariosLogados", (usuariosLogados) => {
                console.log(`Usuários logados na seção ${idSecao}:`, usuariosLogados);
                setUsuarios([...new Set(usuariosLogados)]);
            });

            // Escuta o evento "atualizarVotos" e atualiza os votos para a seção atual
            socket.on("atualizarVotos", (votosRecebidos) => {
                console.log(`Votos atualizados na seção ${idSecao}:`, votosRecebidos);
                setVotos(votosRecebidos);
            });

            // Escuta os eventos de votos (para a seção atual)
            socket.on("receberVotos", (votosRecebidos) => {
                setVotos(votosRecebidos);
            });

            socket.on("mostrarVotos", (votosRecebidos) => {
                setVotos(votosRecebidos);
                setMostrarVotos(true);
            });

            socket.on("resetarRodada", () => {
                setBotaoSelecionado(null);
                setMostrarVotos(false);
            });

            // Verifica se a seção é válida (exemplo de requisição API)
            const checkSecaoExistente = async () => {
                try {
                    const response = await api.get(`/api/secao/${idSecao}`);
                    if (response.status >= 200 && response.status < 300) {
                        if (!response.data.valida) {
                            setTimeout(() => navigate('/criarsecao'), 2000);
                        }
                    } else {
                        console.error(`Erro na requisição: ${response.status} - ${response.config.url}`);
                        setTimeout(() => navigate('/criarsecao'), 2000);
                    }
                } catch (error) {
                    console.error('Erro ao fazer a requisição:', error);
                    setTimeout(() => navigate('/criarsecao'), 2000);
                }
            };

            checkSecaoExistente();
        } else {
            alert("Seção inválida ou não encontrada!");
            navigate("/");
        }

        // Limpa todos os eventos quando o componente desmontar ou quando idSecao mudar
        return () => {
            socket.off("usuariosLogados");
            socket.off("atualizarVotos");
            socket.off("receberVotos");
            socket.off("mostrarVotos");
            socket.off("resetarRodada");
        };
    }, [idSecao, navigate]);

    const handleVotacao = (textoBotao) => {
        // Envia o voto para o servidor
        if (!usuario) {
            console.error("Nenhum usuário logado encontrado!");
            return;
        }
        const novoVoto = { usuario, valor: textoBotao, idSecao };
        socket.emit('voto', novoVoto); // Envia o voto para o servidor


        // Atualiza localmente os votos
        setVotos((prev) => ({
            ...prev,
            [usuario]: textoBotao,
        }));
    };

    const handleClickChange = (textoBotao) => {
        setBotaoSelecionado(textoBotao); // Atualiza o botão selecionado
        setTexto(textoBotao); // Atualiza o texto a ser exibido
        handleVotacao(textoBotao); // Envia o voto
    };

    const handleMostrarVotos = () => {
        socket.emit("pedirVotos", { usuario, idSecao, votos });
        setMostrarVotos(true); // Atualiza o estado para exibir os votos
        setMostrarVotosClicado(true); // Marca o botão como clicado
    };

    const handleNovaRodada = () => {
        // Emite o evento para o servidor iniciar a nova rodada
        socket.emit("novaRodada", { idSecao, votos });

        // Atualiza o estado local para refletir imediatamente no cliente
        setVotos({});
        setBotaoSelecionado(null);
        setMostrarVotos(false);
    };

    const handleSair = () => {
        if (!usuario) {
            console.error("HandlerSair: Nenhum usuário logado encontrado!");
            return;
        }

        // Emite o evento para o servidor para remover o usuário da lista de logados
        socket.emit("sair", { usuario, idSecao });

        // Limpa o usuário do estado local
        localStorage.removeItem("usuario");
        setUsuario(""); // Atualiza o estado do usuário para vazio

        // Redireciona para a página de login usando useNavigate
        navigate("/criarsecao"); // Substitua "/login" pela rota que deseja redirecionar
    };

    return (
        <div className="secao-main">
            <div className="barra-superior">
                <Botao
                    texto="Sair"
                    onClickChange={handleSair}
                />
                <Botao
                    texto="Nova Rodada"
                    onClickChange={handleNovaRodada}
                    className="nova-rodada" // Classe adicional para estilização, se necessário
                />
            </div>

            <div className="content-data">
                <div className="usuarios-logados">
                    <h1>Bem-vindo, {usuario}</h1>
                    <div className="secao-nome">Seção ID: {idSecao}</div>
                    <p>Usuários Logados:</p>
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
                    {["1", "2", "3", "5", "8", "13", "21", "=D"].map((valor) => (
                        <Botao
                            key={valor}
                            texto={valor}
                            foiClicado={botaoSelecionado === valor}
                            onClickChange={() => handleClickChange(valor)}
                            className={botaoSelecionado === valor ? 'secao-botao-clicado' : ''}
                        />
                    ))}
                </div>

            </div>
            <div className="mostrar-votos-main">
                <div className="secao-mostrar">
                    <Botao
                        texto="Mostrar Votos"
                        onClickChange={handleMostrarVotos}
                        disabled={!todosVotaram}
                        className="mostrar-votos" // Classe adicional
                    />
                </div>

                <div className="secao-votos">
                    <p>Votos dos usuários:</p>
                    {mostrarVotos && Object.keys(votos).length > 0 && (
                        <div className="votos-usuarios-visiveis">
                            <ul>
                                {usuarios.map((user, index) => (
                                    <li key={index}>
                                        {user}: <span className="voto-valor">{votos[user] || "Ainda não votou"}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Secao;
