import "./Secao.css"
import Botao from "../Botao/Botao"
import socket from '../../comunication/socket';
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import Icon from '@mdi/react';
import { mdiLogout, mdiShareVariant, mdiRefresh, mdiWeatherNight, mdiWeatherSunny, mdiClockOutline } from '@mdi/js';
import { useTheme } from '../../contexts/ThemeContext';
import useTimer from '../../hooks/useTimer';

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
    const [tipo, setTipo] = useState("votante"); // Novo: Busca o tipo do usuário (votante ou observador)
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarVotos, setMostrarVotos] = useState(false);
    const [emojiAleatorio, setEmojiAleatorio] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
    const [timerReset, setTimerReset] = useState(0);
    const [timerStartTime, setTimerStartTime] = useState(null);


    // Hooks de roteamento, tema e cronômetro
    const { idSecao } = useParams();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { formattedTime, reset: resetTimer } = useTimer(timerReset, timerStartTime);

    // Configuração dos eventos do Socket
    const configureSocketEvents = (usuarioLogado, tipoLogado) => {
        socket.emit('usuarioLogado', { usuario: usuarioLogado, idSecao, tipo: tipoLogado });

        socket.on("usuariosLogados", (usuariosLogados) => {
            // Novo: Tratar ambos os formatos (array de strings e array de objetos) e convertê-los para o formato de objeto esperado
            const usuariosFormatados = usuariosLogados.map(u => {
                if (typeof u === 'string') {
                    return { nome: u, tipo: 'votante' };
                }
                return u;
            });
            setUsuarios(usuariosFormatados);
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

        socket.on("novaRodada", () => {
            // Reseta o timer para todos os usuários
            setTimerReset(prev => prev + 1);
            setBotaoSelecionado(null);
            setMostrarVotos(false);
            setVotos({});
        });

        socket.on("sincronizarTimer", ({ tempoInicio }) => {
            // Sincroniza o timer com o tempo inicial do servidor
            setTimerStartTime(tempoInicio);
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
        const tipoLogado = localStorage.getItem("tipo") || "votante"; // Novo: Ler tipo de perfil do usuário
        setEmojiAleatorio(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);

        if (!usuarioLogado?.trim()) {
            navigate("/login", { state: { idSecao } });
            return;
        }

        if (idSecao && usuarioLogado) {
            setUsuario(usuarioLogado);
            setTipo(tipoLogado); // Novo: Definir tipo de perfil do usuário
            configureSocketEvents(usuarioLogado, tipoLogado);
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
        
        // Novo: Rejeitar voto de observadores
        if (tipo === 'observador') {
            alert("Observadores não podem votar.");
            return;
        }
        
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
        // Os resets serão feitos via socket para sincronizar todos os usuários
    };

    const handleSair = () => {
        if (!usuario) return;

        socket.emit("sair", { usuario, idSecao });
        localStorage.removeItem("usuario");
        localStorage.removeItem("tipo"); // Novo: Limpa o tipo do perfil do usuário
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
            <div className="menu-secao-container">
                <Icon path={mdiLogout} size={1} onClick={handleSair} className="menu-secao-button" />
                <span className="menu-secao-text">Sair</span>
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
            {usuarios.map((userObj, index) => {
                const userName = typeof userObj === 'string' ? userObj : userObj.nome;
                const userType = typeof userObj === 'string' ? 'votante' : userObj.tipo;
                const isObserver = userType === 'observador';
                
                return (
                    <div key={index} className={`usuario-card ${votos[userName] ? "votou" : ""} ${isObserver ? 'observador' : ''}`}>
                        <strong>
                            {userName}
                        </strong>
                        {isObserver && (
                            <span className="observer-badge" role="img" aria-label="Observador">👁️</span>
                        )}
                        <span className="status-voto">
                            {isObserver ? 'Observando' : (votos[userName] ? "✅ Votou" : "❌ Não votou")}
                        </span>
                        {mostrarVotos && votos[userName] && !isObserver && (
                            <span className="voto-valor">
                                {typeof votos[userName] === "object" ? votos[userName].emoji : obterEmoji(votos[userName])}
                            </span>
                        )}
                    </div>
                );
            })}
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

    // Componente do Cronômetro
    const Timer = () => (
        <div className="timer-container">
            <Icon path={mdiClockOutline} size={0.8} className="timer-icon" />
            <span className="timer-text">{formattedTime}</span>
        </div>
    );

    // Componente da Legenda de Estimativas (versão compacta)
    const LegendaEstimativas = () => (
        <div className="legenda-container">
            <div className="legenda-titulo">Estimativas com Story Points</div>
            <div className="legenda-compacta">
                <span className="legenda-item-compacto">
                    <strong>1 -</strong> Baixa complexidade sem incertezas e pontual
                </span>
                <span className="legenda-item-compacto">
                    <strong>2 -</strong> Baixa complexidade sem incertezas
                </span>
                <span className="legenda-item-compacto">
                    <strong>3 -</strong> Baixa complexidade com incertezas
                </span>
                <span className="legenda-item-compacto">
                    <strong>5 -</strong> Média complexidade sem incertezas
                </span>
                <span className="legenda-item-compacto">
                    <strong>8 -</strong> Média complexidade com incertezas
                </span>
                <span className="legenda-item-compacto">
                    <strong>13 -</strong> Alta complexidade sem incertezas
                </span>
                <span className="legenda-item-compacto">
                    <strong>21 -</strong> Alta complexidade com incertezas
                </span>
            </div>
        </div>
    );

    return (
        <div className="secao-main">
            <MenuSuperior />
            <Timer />
            <div className="content-data">
                <ListaUsuarios />
            </div>
            <div className="secao-content">
                <BotoesVotacao />
            </div>
            <div className="secao-mostrar">
                <Botao
                    texto="Mostrar Votos"
                    onClickChange={handleMostrarVotos}
                    className="mostrar-votos"
                />
            </div>
            <LegendaEstimativas />
        </div>
    )
}

export default Secao;