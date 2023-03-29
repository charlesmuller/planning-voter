import React, { Component,  } from "react";
import "./App.css";

class CriarSecao extends Component {
    render() {
        return (
            <div className="secao-container">
                <form>
                    <h1>Criar Seção de Planning</h1>
                    <div>
                        <label>Sua seção</label>
                        <input type="text" id="id-secao" name="secao" readOnly/>
                    </div>

                    <button type="submit">Entrar</button>
                </form>
            </div>
        )
    }
}

export default CriarSecao;