import React from "react";

export default function ListaParticipantes({
  inscritos,
  usuarioSel,
  onSeleccionarUsuario,
  estadoTorneo,
}) {
  const esInteractivo = estadoTorneo === "IN_COURSE";

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header text-white bg-dark d-flex align-items-center gap-2 py-3">
        <span>Inscritos ({inscritos.length})</span>
      </div>
      <div
        className="card-body p-0"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        {inscritos.length === 0 ? (
          <p className="text-muted text-center p-3">
            No hay arqueros inscritos en este torneo.
          </p>
        ) : (
          <div className="list-group list-group-flush">
            {inscritos.map((ins, idx) => (
              <button
                key={ins.idUsuario}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                  usuarioSel === ins.idUsuario ? "active" : ""
                }`}
                onClick={() =>
                  esInteractivo && onSeleccionarUsuario(ins.idUsuario)
                }
                disabled={!esInteractivo}
              >
                <span>
                  <span className="badge bg-secondary me-2">{idx + 1}</span>
                  {ins.nombre}
                </span>
                <small
                  className={
                    usuarioSel === ins.idUsuario ? "text-white" : "text-muted"
                  }
                >
                  {ins.rut}
                </small>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
