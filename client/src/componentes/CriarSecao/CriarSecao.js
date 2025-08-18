import "./CriarSecao.css";
import Botao from "../Botao/Botao";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function CriarSecao() {
    const [usuario, setUsuario] = useState("");
    const [urlSecao, setUrlSecao] = useState("");
    const navigate = useNavigate();

    const handleGerarURL = async (e) => {
        e.preventDefault();

        if (!usuario) {
            alert("Por favor, digite seu nome de usuário.");
            return;
        }

        try {
            const tokenResponse = await api.get("/csrf-token", {
                withCredentials: true,
            });

            const csrfToken = tokenResponse.data.csrfToken;
            const response = await api.post(
                "/criar-secao",
                {},
                {
                    headers: { "X-CSRF-Token": csrfToken },
                    withCredentials: true,
                }
            );

            const idSecao = response.data.idSecao;
            const urlBase = process.env.REACT_APP_URL_LOCAL || "http://localhost:3000";
            const urlCompleta = `${urlBase}/secao/${idSecao}`;

            setUrlSecao(urlCompleta);

            // Armazena o nome do usuário e redireciona automaticamente
            localStorage.setItem("usuario", usuario);
            navigate(`/secao/${idSecao}`, { state: { usuario } });
        } catch (error) {
            console.error("Erro ao gerar URL:", error);
        }
    };

    return (
        <div className="criar-container">
            <div className="secao-container">
                <form onSubmit={handleGerarURL}>
                    <h1>Criar seção de Planning Voter</h1>

                    <div className="input-container">
                        <label>Digite seu nome de usuário</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>
                    <Botao texto="Criar e entrar" type="submit"/>
                 </form>
            </div>
        </div>
    );
}

export default CriarSecao;
