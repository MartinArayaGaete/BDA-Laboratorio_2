import React from "react";

export default function TorneoCabecera({
  torneo,
  onIniciar,
  onFinalizar,
  onVolver,
}) {
  if (!torneo) return null;

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "COMPLETED":
        return "bg-success";
      case "IN_COURSE":
        return "bg-primary";
      default:
        return "bg-warning text-dark";
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-1">{torneo.nombreTorneo}</h3>
          <span className={`badge ${getBadgeClass(torneo.estadoTorneo)}`}>
            {torneo.estadoTorneo}
          </span>
        </div>
        <div className="d-flex gap-2">
          {torneo.estadoTorneo === "NOT_STARTED" && (
            <button className="btn btn-warning" onClick={onIniciar}>
              ▶ Iniciar Torneo
            </button>
          )}
          {torneo.estadoTorneo === "IN_COURSE" && (
            <button className="btn btn-success" onClick={onFinalizar}>
              🏁 Finalizar Torneo
            </button>
          )}
          <button className="btn btn-outline-dark" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
