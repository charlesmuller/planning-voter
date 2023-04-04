import "./Login.css";
import Menu from "../Menu/Menu";

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

                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    )
}

export default Login;