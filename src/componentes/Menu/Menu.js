import React from "react";
import { Link } from 'react-router-dom';
import "./Menu.css";


function Menu() {
    return (
        <div className="logo-container-menu">
            <div className="nav-container">
                <div className="nav-menu">
                    <nav>
                        <ul>
                            <li>
                                <Link to={'/login'}>Login</Link>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <Link to={'/criarsecao'}>Criar Seção</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

        </div>
    );
}

export default Menu;