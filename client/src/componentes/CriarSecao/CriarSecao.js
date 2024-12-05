import "./CriarSecao.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState } from "react";
import axios from "axios";

function CriarSecao() {
    const [urlSecao, setUrlSecao] = useState("");

    const handleGerarURL = async () => {
        const usuario = localStorage.getItem("usuario");
        if (!usuario) {
            alert("Usuário não logado!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:4000/gerar-secao", { usuario });
            setUrlSecao(response.data.url);
        } catch (error) {
            console.error("Erro ao gerar URL:", error);
        }
    };

    return (
        <div className="criar-container">
            <Menu />
            <div className="secao-container">
                <form>
                    <h1>Criar Seção de Planning</h1>
                    <div>
                        <label>Link da seção</label>
                        <input type="text" readOnly value={urlSecao || "Clique no botão para gerar"} />
                    </div>

                    <Botao texto="Gerar URL" onClickChange={handleGerarURL} />
                </form>
            </div>
        </div>
    );
}

export default CriarSecao;
