import "./Login.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
    const [usuario, setUsuario] = useState(""); // Para armazenar o valor do email
    const navigate = useNavigate(); // Hook para navegação
    const location = useLocation();
    const [secaoUrl, setSecaoUrl] = useState("");
    const { state } = location;

    useEffect(() => {
        if (location.state?.urlSecao) {
            console.log("URL da seção:", location.state.urlSecao);
            setSecaoUrl(location.state.urlSecao); // Captura a URL da seção
        }
    }, [location]);

    const fetchSecaoUrl = async (usuario) => {
        try {
            const response = await fetch(`/api/getSecaoUrl?usuario=${usuario}`);
            const data = await response.json();
            if (data.secaoUrl) {
                setSecaoUrl(data.secaoUrl); // Atualiza a URL da seção no estado
            } else {
                alert("URL da seção não encontrada!");
            }
        } catch (error) {
            console.error("Erro ao buscar a URL da seção:", error);
            alert("Erro ao recuperar a URL da seção.");
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (usuario) {
            console.log("URL da seção:", localStorage.getItem("secaoUrl"));
            localStorage.setItem("usuario", usuario);

            // Redirecionar para a URL da seção
            if (secaoUrl) {
                navigate(secaoUrl);
            } else {
                alert("URL da seção não encontrada!");
            }
        } else {
            alert("Por favor, digite um usuário.");
        }
    };

    return (
        <div className="login-container">
            <Menu />
            <div className="usuario-container">
                <form onSubmit={handleLogin}>
                    <h1>Acessar Seção de Planning</h1>
                    <div className="input-container">
                        <label>Digite seu usuário</label>
                        <input
                            type="text"
                            id="text"
                            name="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)} // Atualiza o estado com o input
                        />
                    </div>

                    <Botao type="submit" texto="Entrar" />
                </form>
            </div>
        </div>
    )
}

export default Login;