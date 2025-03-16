import "./Secao.css"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import Icon from '@mdi/react';
import { mdiLogout, mdiShareVariant, mdiRefresh } from '@mdi/js';

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
    const [urlSecao] = useState(window.location.href);
    const [emojiAleatorio, setEmojiAleatorio] = useState(null);

    useEffect(() => {
        const usuarioLogado = localStorage.getItem("usuario");
        setEmojiAleatorio(emojis[Math.floor(Math.random() * emojis.length)]);

        if (!usuarioLogado || usuarioLogado.trim() === "") {
            navigate("/login", { state: { idSecao } });
            return;
        }

        if (idSecao && usuarioLogado) {
            // Define o usuário no estado
            setUsuario(usuarioLogado);

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
        if (textoBotao === "emoji") {
            handleVotacao(emojiAleatorio ? emojiAleatorio.emoji : "emoji");
        } else {
            handleVotacao(textoBotao);
        }
    };

    const handleMostrarVotos = () => {
        socket.emit("pedirVotos", { usuario, idSecao, votos });
        setMostrarVotos(true); // Atualiza o estado para exibir os votos
        setMostrarVotosClicado(true); // Marca o botão como clicado
    };

    const handleNovaRodada = () => {
        console.log("Nova rodada iniciada!");
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

    const handleCopy = () => {
        navigator.clipboard.writeText(urlSecao)
            .then(() => {
                alert("Link copiado para a área de transferência!");
            })
            .catch((err) => {
                console.error("Erro ao copiar o link: ", err);
            });
    };

    const emojis = [
        { nome: "morango", emoji: "🍓" },
        { nome: "hamburguer", emoji: "🍔" },
        { nome: "pizza", emoji: "🍕" },
        { nome: "sorvete", emoji: "🍦" },
        { nome: "cachorro-quente", emoji: "🌭" },
        { nome: "batata frita", emoji: "🍟" },
        { nome: "bolo", emoji: "🎂" },
        { nome: "pudim", emoji: "🍮" },
        { nome: "taco", emoji: "🌮" },
        { nome: "sushi", emoji: "🍣" },
        { nome: "maçã", emoji: "🍎" },
        { nome: "banana", emoji: "🍌" },
        { nome: "abacaxi", emoji: "🍍" },
        { nome: "uvas", emoji: "🍇" },
        { nome: "laranja", emoji: "🍊" },
        { nome: "melancia", emoji: "🍉" },
        { nome: "pipoca", emoji: "🍿" },
        { nome: "chocolate", emoji: "🍫" },
        { nome: "caramelo", emoji: "🍬" },
        { nome: "café", emoji: "☕" },
    ];

    const obterEmoji = (nome) => {
        const emoji = emojis.find(e => e.nome === nome);
        return emoji ? emoji.emoji : nome; // Se não encontrar, retorna o nome como está
    };

    return (
        <div className="secao-main">
            <div className="barra-superior">
                <div className="menu-secao-container">
                    <Icon
                        path={mdiLogout}
                        size={1}
                        onClick={handleSair}
                        className="menu-secao-button"
                    />
                    <span className="menu-secao-text">Sair</span>
                </div>

                <div className="menu-secao-container">
                    <Icon
                        path={mdiRefresh}
                        size={1}
                        className="menu-secao-button"
                        onClick={handleNovaRodada}
                    />
                    <span className="menu-secao-text">Reiniciar</span>
                </div>
                <div className="menu-secao-container">
                    <Icon
                        path={mdiShareVariant}
                        size={1}
                        className="menu-secao-button"
                        onClick={handleCopy}
                    />
                    <span className="menu-secao-text">Convide</span>
                </div>
            </div>

            <div className="content-data">
                <div className="usuarios-logados">
                    {usuarios.map((user, index) => (
                        <div
                            key={index}
                            className={`usuario-card ${votos[user] ? "votou" : ""}`}
                        >
                            <strong>{user}</strong>
                            <span className="status-voto">
                                {votos[user] ? "✅ Votou" : "❌ Não votou"}
                            </span>

                            {mostrarVotos && votos[user] && (
                                <span className="voto-valor">
                                    {typeof votos[user] === "object" ? votos[user].emoji : obterEmoji(votos[user])}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="secao-content">
                    {["1", "2", "3", "5", "8", "13", "21"].map((valor) => (
                        <Botao
                            key={valor}
                            texto={valor}
                            foiClicado={botaoSelecionado === valor}
                            onClickChange={() => handleClickChange(valor)}
                            className={botaoSelecionado === valor ? 'secao-botao-clicado' : ''}
                        />
                    ))}
                    <Botao
                        key="emoji"
                        texto={emojiAleatorio ? emojiAleatorio.emoji : ""}
                        foiClicado={botaoSelecionado === "emoji"}
                        onClickChange={() => handleClickChange("emoji")}
                        className={botaoSelecionado === "emoji" ? 'secao-botao-clicado' : ''}
                    />

                </div>
            </div>
            <div className="secao-mostrar">
                <Botao
                    texto="Mostrar Votos"
                    onClickChange={handleMostrarVotos}
                    disabled={!todosVotaram}
                    className="mostrar-votos" // Classe adicional
                />
            </div>
        </div>
    )
}

export default Secao;