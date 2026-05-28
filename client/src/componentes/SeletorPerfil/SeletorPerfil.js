import "./SeletorPerfil.css";

const PERFIS = [
    {
        id: "votante",
        icone: "👤",
        titulo: "Votante",
        descricao: "Participa das rodadas e envia votos",
    },
    {
        id: "observador",
        icone: "👁️",
        titulo: "Observador",
        descricao: "Acompanha a seção sem votar (ex.: PO, Gestores e etc.)",
    },
];

function SeletorPerfil({ value, onChange, disabled }) {
    return (
        <div className="seletor-perfil">
            <div className="seletor-perfil-label">
                Escolha seu perfil
                <span className="seletor-perfil-ajuda">
                    O perfil define se você poderá votar ou apenas acompanhar a seção.
                </span>
            </div>
            <div className="seletor-perfil-opcoes" role="radiogroup" aria-label="Perfil do usuário">
                {PERFIS.map((perfil) => {
                    const selecionado = value === perfil.id;
                    return (
                        <button
                            key={perfil.id}
                            type="button"
                            role="radio"
                            aria-checked={selecionado}
                            disabled={disabled}
                            className={`seletor-perfil-card ${selecionado ? "selecionado" : ""}`}
                            onClick={() => onChange(perfil.id)}
                        >
                            <span className="seletor-perfil-icone" aria-hidden="true">
                                {perfil.icone}
                            </span>
                            <span className="seletor-perfil-titulo">{perfil.titulo}</span>
                            <span className="seletor-perfil-descricao">{perfil.descricao}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SeletorPerfil;
