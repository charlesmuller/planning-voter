import "./Login.css";
import Botao from "../Botao/Botao";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../api/api";

function Login() {
    const [usuario, setUsuario] = useState("");
    const [tipo, setTipo] = useState("votante"); // Novo: busca o tipo do usuário (votante ou observador)
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const idSecaoFromState = location.state?.idSecao;
    const idSecaoFromQuery = new URLSearchParams(location.search).get("idSecao");
    const idSecao = idSecaoFromState || idSecaoFromQuery;

    useEffect(() => {
    }, [location, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // Validação do usuário
        if (!usuario.trim()) {
            setErrorMessage("Por favor, digite seu usuário.");
            return;
        }

        if (usuario.length < 3) {
            setErrorMessage("O usuário deve ter no mínimo 3 caracteres.");
            return;
        }

        // Validação do reCAPTCHA
        const recaptchaToken = recaptchaRef?.current?.getValue();
        const isDev = process.env.NODE_ENV === 'development';
        const siteKeyDefined = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

        if (siteKeyDefined && !recaptchaToken) {
            setErrorMessage("Por favor, confirme que você não é um robô.");
            return;
        }

        // Validação se tem idSecao
        if (!idSecao) {
            setErrorMessage("ID da seção inválido.");
            return;
        }

        setLoading(true);

        try {
            // Validar login com reCAPTCHA no backend
            const response = await api.post(
                "/login",
                { recaptchaToken, usuario, idSecao },
                { withCredentials: true }
            );

            if (response.status === 200) {
                localStorage.setItem("usuario", usuario);
                localStorage.setItem("tipo", tipo); // Novo: Salvar tipo de perfil do usuário
                navigate(`/secao/${idSecao}`, { state: { usuario, tipo } });
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);

            if (error.response?.status === 400) {
                setErrorMessage(error.response.data.error || "Validação falhou. Tente novamente.");
            } else if (error.response?.status === 403) {
                setErrorMessage("Acesso negado. Tente novamente mais tarde.");
            } else if (error.response?.status === 404) {
                setErrorMessage("Seção não encontrada.");
            } else {
                setErrorMessage("Erro ao fazer login. Tente novamente mais tarde.");
            }

            // Resetar reCAPTCHA em caso de erro
            if (recaptchaRef?.current) {
                recaptchaRef.current.reset();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="usuario-container">
                <form onSubmit={handleLogin}>
                    <h1>Acessar Seção de Planning</h1>

                    {errorMessage && (
                        <div style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px' }}>
                            {errorMessage}
                        </div>
                    )}

                    <div className="input-container">
                        <label>Digite seu usuário</label>
                        <input
                            type="text"
                            id="text"
                            name="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            disabled={loading}
                            minLength="3"
                            placeholder="Mínimo 3 caracteres"
                        />
                    </div>

                    {/* Tipo de perfil */}
                    <div className="input-container" style={{ marginBottom: '1.5rem' }}>
                        <label>Escolha seu perfil</label>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="votante"
                                    checked={tipo === "votante"}
                                    onChange={() => setTipo("votante")}
                                    disabled={loading}
                                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                                />
                                <span>👤 Votante</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="observador"
                                    checked={tipo === "observador"}
                                    onChange={() => setTipo("observador")}
                                    disabled={loading}
                                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                                />
                                <span>👁️ Observador (sem votação)</span>
                            </label>
                        </div>
                    </div>

                    {/* reCAPTCHA widget */}
                    {process.env.REACT_APP_RECAPTCHA_SITE_KEY ? (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                theme={isDarkMode ? "dark" : "light"}
                                onChange={() => setErrorMessage("")}
                            />
                        </div>
                    ) : null}

                    <Botao 
                        type="submit" 
                        texto={loading ? "Entrando..." : "Entrar"}
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    />
                </form>
            </div>
        </div>
    )
}

export default Login;