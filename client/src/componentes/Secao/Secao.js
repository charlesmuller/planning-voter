import "./Secao.css"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import Icon from '@mdi/react';
import { mdiLogout, mdiShareVariant, mdiRefresh, mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import { useTheme } from '../../contexts/ThemeContext';

// Constantes
const FIBONACCI_SEQUENCE = ["1", "2", "3", "5", "8", "13", "21"];

// Lista de emojis para votação
const EMOJIS = [
    { nome: "morango", emoji: "🍓" }, { nome: "hamburguer", emoji: "🍔" },
    { nome: "pizza", emoji: "🍕" }, { nome: "sorvete", emoji: "🍦" },
    { nome: "cachorro-quente", emoji: "🌭" }, { nome: "batata frita", emoji: "🍟" },
    { nome: "bolo", emoji: "🎂" }, { nome: "pudim", emoji: "🍮" },
    { nome: "taco", emoji: "🌮" }, { nome: "sushi", emoji: "🍣" },
    { nome: "maçã", emoji: "🍎" }, { nome: "banana", emoji: "🍌" },
    { nome: "abacaxi", emoji: "🍍" }, { nome: "uvas", emoji: "🍇" },
    { nome: "laranja", emoji: "🍊" }, { nome: "melancia", emoji: "🍉" },
    { nome: "pipoca", emoji: "🍿" }, { nome: "chocolate", emoji: "🍫" },
    { nome: "caramelo", emoji: "🍬" }, { nome: "café", emoji: "☕" }
];

function Secao() {
    // Estados do componente
    const [botaoSelecionado, setBotaoSelecionado] = useState(null);
    const [votos, setVotos] = useState({});
    const [usuario, setUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarVotos, setMostrarVotos] = useState(false);
    const [emojiAleatorio, setEmojiAleatorio] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

    // Hooks de roteamento e tema
    const { idSecao } = useParams();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    // Configuração dos eventos do Socket
    const configureSocketEvents = (usuarioLogado) => {
        socket.emit('usuarioLogado', { usuario: usuarioLogado, idSecao });

        socket.on("usuariosLogados", (usuariosLogados) => {
            setUsuarios([...new Set(usuariosLogados)]);
        });

        socket.on("atualizarVotos", setVotos);

        socket.on("receberVotos", setVotos);

        socket.on("mostrarVotos", (votosRecebidos) => {
            setVotos(votosRecebidos);
            setMostrarVotos(true);
        });

        socket.on("resetarRodada", () => {
            setBotaoSelecionado(null);
            setMostrarVotos(false);
        });
    };

    // Verificação da seção via API
    const verificarSecao = async () => {
        try {
            const response = await api.get(`/secao/${idSecao}`);
            if (!response.data.valida || response.status >= 300) {
                setTimeout(() => navigate('/criarsecao'), 2000);
            }
        } catch (error) {
            setTimeout(() => navigate('/criarsecao'), 2000);
        }
    };

    // Função para lidar com o fechamento da página
    const handleBeforeUnload = (usuarioAtual, secaoId) => {
        return (event) => {
            // Notifica o servidor que o usuário está saindo
            socket.emit("sair", { usuario: usuarioAtual, idSecao: secaoId });
        };
    };

    useEffect(() => {
        const usuarioLogado = localStorage.getItem("usuario");
        setEmojiAleatorio(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

        if (!usuarioLogado?.trim()) {
            navigate("/login", { state: { idSecao } });
            return;
        }

        if (idSecao && usuarioLogado) {
            setUsuario(usuarioLogado);
            configureSocketEvents(usuarioLogado);
            verificarSecao();

            // Adiciona evento para detectar fechamento da página
            const handleUnload = handleBeforeUnload(usuarioLogado, idSecao);
            window.addEventListener('beforeunload', handleUnload);

            // Verifica se a seção é válida (exemplo de requisição API)
            const checkSecaoExistente = async () => {
                try {
                    const response = await api.get(`/secao/${idSecao}`);
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
            // Remove todos os listeners de eventos
            socket.off("usuariosLogados");
            socket.off("atualizarVotos");
            socket.off("receberVotos");
            socket.off("mostrarVotos");
            socket.off("resetarRodada");

            // Remove o evento de beforeunload
            const handleUnload = handleBeforeUnload(usuarioLogado, idSecao);
            window.removeEventListener('beforeunload', handleUnload);

            // Notifica o servidor que o usuário está saindo
            socket.emit("sair", { usuario: usuarioLogado, idSecao });
        };
    }, [idSecao, navigate]);

    // Handlers para ações do usuário
    const handleVotacao = (textoBotao) => {
        if (!usuario) return;
        
        const novoVoto = { usuario, valor: textoBotao, idSecao };
        socket.emit('voto', novoVoto);
        
        setVotos(prev => ({
            ...prev,
            [usuario]: textoBotao,
        }));
    };

    const handleClickChange = (textoBotao) => {
        setBotaoSelecionado(textoBotao);
        
        if (textoBotao === "emoji") {
            handleVotacao(emojiAleatorio?.emoji || "emoji");
        } else {
            handleVotacao(textoBotao);
        }
    };

    const handleMostrarVotos = () => {
        socket.emit("pedirVotos", { usuario, idSecao, votos });
        setMostrarVotos(true);
    };

    const handleNovaRodada = () => {
        socket.emit("novaRodada", { idSecao, votos });
        setEmojiAleatorio(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
        setVotos({});
        setBotaoSelecionado(null);
        setMostrarVotos(false);
    };

    const handleSair = () => {
        if (!usuario) return;

        socket.emit("sair", { usuario, idSecao });
        localStorage.removeItem("usuario");
        setUsuario("");
        navigate("/criarsecao");
    };

    const handleCopy = (event) => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                // Obtém a posição do mouse no momento do clique
                const { clientX, clientY } = event;

                // Exibe o tooltip próximo ao cursor
                setTooltip({ visible: true, x: clientX, y: clientY });

                // Esconde o tooltip após 2 segundos
                setTimeout(() => setTooltip({ visible: false, x: 0, y: 0 }), 2000);
            })
            .catch((err) => {
                console.error("Erro ao copiar o link: ", err);
            });
    };

    // Funções utilitárias
    const obterEmoji = (nome) => {
        const emoji = EMOJIS.find(e => e.nome === nome);
        return emoji ? emoji.emoji : nome;
    };

    // Componentes da interface
    const MenuSuperior = () => (
        <div className="barra-superior">
            <div className="menu-secao-container">
                <Icon path={mdiLogout} size={1} onClick={handleSair} className="menu-secao-button" />
                <span className="menu-secao-text">Sair</span>
            </div>
            <div className="menu-secao-container">
                <Icon path={mdiRefresh} size={1} className="menu-secao-button" onClick={handleNovaRodada} />
                <span className="menu-secao-text">Reiniciar</span>
            </div>
            <div className="menu-secao-container">
                <Icon path={mdiShareVariant} size={1} className="menu-secao-button" onClick={handleCopy} />
                <span className="menu-secao-text">Convide</span>
            </div>
            <div className="menu-secao-container">
                <Icon 
                    path={isDarkMode ? mdiWeatherSunny : mdiWeatherNight} 
                    size={1} 
                    className="menu-secao-button theme-toggle" 
                    onClick={toggleTheme} 
                    title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
                />
                <span className="menu-secao-text">
                    {isDarkMode ? "Claro" : "Escuro"}
                </span>
            </div>
            {tooltip.visible && (
                <div className="tooltip" style={{ top: tooltip.y + 10 + "px", left: tooltip.x + 10 + "px" }}>
                    Link copiado! ✅
                </div>
            )}
        </div>
    );

    const ListaUsuarios = () => (
        <div className="usuarios-logados">
            {usuarios.map((user, index) => (
                <div key={index} className={`usuario-card ${votos[user] ? "votou" : ""}`}>
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
    );

    const BotoesVotacao = () => (
        <div className="secao-content">
            {FIBONACCI_SEQUENCE.map((valor) => (
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
                texto={emojiAleatorio?.emoji || ""}
                foiClicado={botaoSelecionado === "emoji"}
                onClickChange={() => handleClickChange("emoji")}
                className={botaoSelecionado === "emoji" ? 'secao-botao-clicado' : ''}
            />
        </div>
    );

    return (
        <div className="secao-main">
            <MenuSuperior />
            <div className="content-data">
                <ListaUsuarios />
                <BotoesVotacao />
            </div>
            <div className="secao-mostrar">
                <Botao
                    texto="Mostrar Votos"
                    onClickChange={handleMostrarVotos}
                    className="mostrar-votos"
                />
            </div>
        </div>
    )
}

export default Secao;