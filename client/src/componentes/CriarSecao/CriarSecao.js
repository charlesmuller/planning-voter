import "./CriarSecao.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function CriarSecao() {
    const [urlSecao, setUrlSecao] = useState("");
    const [linkGerado, setLinkGerado] = useState(false);
    const navigate = useNavigate();

    // Função para gerar a URL da seção
    const handleGerarURL = async () => {
        try {
            const response = await axios.post("http://localhost:4000/api/criar-secao");
            const idSecao = response.data.idSecao;
            const urlBase = process.env.REACT_APP_URL_LOCAL || "http://localhost:3000"; // URL local
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
