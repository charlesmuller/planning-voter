import React, { Component } from "react";
import "../App.css";

class Login extends Component {
    render() {
        return (
            <div className="usuario-container">
                <form>
                    <h1>Acessar Seção de Planning</h1>
                    <div>
                        <label htmlFor="email">Seu usuário</label>
                        <input type="email" id="email" name="email" />
                    </div>

                    <button type="submit">Entrar</button>
                </form>
            </div>
        )
    }
}

export default Login;