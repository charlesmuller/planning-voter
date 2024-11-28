import "./Login.css";
import Menu from "../Menu/Menu";
import Botao from "../Botao/Botao";


function Login() {
    return (
        <div className="login-container">
            <Menu />
            <div className="usuario-container">
                <form>
                    <h1>Acessar Seção de Planning</h1>
                    <div className="input-container">
                        <label>Digite seu usuário</label>
                        <input type="email" id="email" name="email" />
                    </div>

                    <Botao type="submit" texto="Entrar" />
                </form>
            </div>
        </div>
    )
}

export default Login;