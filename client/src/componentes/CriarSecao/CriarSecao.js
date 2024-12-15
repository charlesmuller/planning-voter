import "./CriarSecao.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import React, { useState } from "react";
import api from "../../api/api";

function CriarSecao() {
    const [urlSecao, setUrlSecao] = useState("");
    const [linkGerado, setLinkGerado] = useState(false);

    // Função para gerar a URL da seção
    const handleGerarURL = async () => {
        try {
            const tokenResponse = await api.get("/csrf-token");
            const csrfToken = tokenResponse.data.csrfToken;
            
            const response = await api.post("/criar-secao", {},{
                headers: {
                    "X-CSRF-Token": csrfToken,
                },
            });

            const idSecao = response.data.idSecao;
            const urlBase = process.env.REACT_APP_URL_LOCAL || "http://localhost:3000";
            const urlCompleta = `${urlBase}/login?idSecao=${idSecao}`;
            setUrlSecao(urlCompleta);
            setLinkGerado(true);
        } catch (error) {
            console.error("Erro ao gerar URL:", error);
        }
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

    return (
        <div className="criar-container">
            <Menu />
            <div className="secao-container">
                <form>
                    <h1>Criar Seção de Planning</h1>

                    <Botao texto="Gerar URL" onClickChange={handleGerarURL} />

                    {linkGerado && (
                        <div className="link-gerado">
                            <p>Compartilhe o link:</p>
                            <input
                                type="text"
                                readOnly
                                value={urlSecao}
                            />

                            <Botao texto="Copiar" onClickChange={handleCopy} />
                        </div>

                    )}

                </form>
            </div>
        </div>
    );
}

export default CriarSecao;
