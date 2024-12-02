import "./Login.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [usuario, setUsuario] = useState(""); // Para armazenar o valor do email
    const navigate = useNavigate(); // Hook para navegação

    // Função para lidar com o submit do formulário
    const handleLogin = (e) => {
        e.preventDefault(); // Previne o comportamento padrão de submit do formulário
        // Aqui, você pode validar ou processar o email (por exemplo, se for um formato válido)
        console.log("Usuário:", usuario);

        if (usuario) {
            // Armazenando o usuário no localStorage
            localStorage.setItem('usuario', usuario);

            // Redirecionando para /secao
            navigate("/secao");
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
                            type="email"
                            id="email"
                            name="email"
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