import React from "react";
import "./Start.css";
import Menu from "../Menu/Menu";
import { useLocation } from "react-router-dom";


function Start() {
    // Criei a variável isHomePage para verificar se o path é a homepage e se for apenas retornar ela, pois sem verificar isso a homepage aparecia em todas as telas
    const location = useLocation()
    const isHomePage = location.pathname === "/"
    return (
        <>
            {isHomePage && (
                <div className="start-container">
                    <Menu />
                    <div className="logo-container-menu">
                        <h1>Planning Voter</h1>
                    </div>
                </div>
            )
            }

        </>
    );
}

export default Start;