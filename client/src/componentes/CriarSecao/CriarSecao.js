import "./CriarSecao.css";
import Botao from "../Botao/Botao";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../api/api";

function CriarSecao() {
    const [usuario, setUsuario] = useState("");
    const [tipo, setTipo] = useState("votante"); // Novo: perfil ao criar seção
    const [urlSecao, setUrlSecao] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const handleGerarURL = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // Validação do nome do usuário
        if (!usuario.trim()) {
            setErrorMessage("Por favor, digite seu nome de usuário.");
            return;
        }

        if (usuario.length < 3) {
            setErrorMessage("O nome de usuário deve ter no mínimo 3 caracteres.");
            return;
        }

        // Validação do reCAPTCHA
        const recaptchaToken = recaptchaRef?.current?.getValue();
        
        // Em desenvolvimento sem chave, permite continuar
        const isDev = process.env.NODE_ENV === 'development';
        const siteKeyDefined = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
        
        if (siteKeyDefined && !recaptchaToken) {
            setErrorMessage("Por favor, confirme que você não é um robô.");
            return;
        }
        
        setLoading(true);

        try {
            // Obter token CSRF
            const tokenResponse = await api.get("/csrf-token", {
                withCredentials: true,
            });

            const csrfToken = tokenResponse.data.csrfToken;
            
            // Criar seção com validação de reCAPTCHA
            const response = await api.post(
                "/criar-secao",
                { recaptchaToken, usuario, tipo },
                {
                    headers: { "X-CSRF-Token": csrfToken },
                    withCredentials: true,
                }
            );

            const idSecao = response.data.idSecao;
            const urlBase = process.env.REACT_APP_URL_LOCAL || "http://localhost:3000";
            const urlCompleta = `${urlBase}/secao/${idSecao}`;

            setUrlSecao(urlCompleta);
            localStorage.setItem("usuario", usuario);
            localStorage.setItem("tipo", tipo); // Salva perfil criado
            
            // Redirecionar instantaneamente
            navigate(`/secao/${idSecao}`, { state: { usuario, tipo } });

        } catch (error) {
            console.error("Erro ao gerar seção:", error);
            
            // Mensagens de erro mais específicas
            if (error.response?.status === 400) {
                setErrorMessage(error.response.data.error || "Validação falhou. Tente novamente.");
            } else if (error.response?.status === 403) {
                setErrorMessage("Requisição bloqueada por segurança. Recarregue e tente novamente.");
            } else {
                setErrorMessage("Erro ao criar seção. Tente novamente mais tarde.");
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
        <div className="criar-container">
            <div className="secao-container">
                <form onSubmit={handleGerarURL}>
                    <h1>Criar seção de Planning Voter</h1>

                    {errorMessage && (
                        <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px' }}>
                            {errorMessage}
                        </div>
                    )}

                    <div className="input-container">
                        <label>Digite seu nome de usuário</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            disabled={loading}
                            minLength="3"
                            placeholder="Mínimo 3 caracteres"
                        />
                    </div>

                    {/* Seleção de tipo de perfil */}
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
                                />
                                <span>👁️ Observador (sem votação)</span>
                            </label>
                        </div>
                    </div>

                    {/* reCAPTCHA widget */}
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                            theme={isDarkMode ? "dark" : "light"}
                            onChange={() => setErrorMessage("")}
                        />
                    </div>

                    <Botao 
                        texto={loading ? "Criando..." : "Criar e entrar"} 
                        type="submit"
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    />
                 </form>
            </div>
        </div>
    );
}

export default CriarSecao;
