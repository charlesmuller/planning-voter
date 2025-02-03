import "./Login.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
    const [usuario, setUsuario] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const idSecao = new URLSearchParams(location.search).get("idSecao");
    const [isObservador, setIsObservador] = useState(false);

    // console.log("observador: ", isObservador);

    useEffect(() => {
    }, [location, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (usuario) {
            localStorage.setItem("usuario", JSON.stringify({ nome: usuario, isObservador }));
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
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>
                    <div className="input-watcher">
                        <input
                            type="checkbox"
                            id="observador"
                            checked={isObservador}
                            onChange={() => setIsObservador(!isObservador)}
                        />
                        <label htmlFor="observador">Entrar como observador</label>
                    </div>
                    <Botao type="submit" texto="Entrar" />
                </form>
            </div>
        </div>
    )
}

export default Login;