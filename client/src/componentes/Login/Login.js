import "./Login.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

function Login() {
    const [usuario, setUsuario] = useState(""); // Para armazenar o valor do email
    const navigate = useNavigate();
    const [secaoUrl, setSecaoUrl] = useState("");
    const location = useLocation();
    const idSecao = new URLSearchParams(location.search).get("idSecao");

    useEffect(() => {
        // console.log("ID da seção no /login:", idSecao);

    }, [location, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (usuario) {
            // console.log("URL da seção:", localStorage.getItem("secaoUrl"));
            localStorage.setItem("usuario", usuario);
            navigate(`/secao/${idSecao}`, { state: { usuario } });
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