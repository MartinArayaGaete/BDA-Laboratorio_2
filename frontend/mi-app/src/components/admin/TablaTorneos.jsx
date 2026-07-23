import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";

const ESTADOS = {
  NOT_STARTED: { class: "bg-secondary", text: "No Iniciado" },
  IN_COURSE: { class: "bg-primary", text: "En Curso" },
  COMPLETED: { class: "bg-success", text: "Finalizado" },
};

export default function TablaTorneos({ torneos, onTorneoEliminado }) {
  const navigate = useNavigate();
  const [eliminando, setEliminando] = useState(null);

  const handleEliminar = async (torneo) => {
    if (!window.confirm(`¿Eliminar el torneo "${torneo.nombreTorneo}"?`))
      return;

    setEliminando(torneo.idTorneo);
    try {
      await torneoService.eliminarTorneo(torneo.idTorneo);
      if (onTorneoEliminado) onTorneoEliminado();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar el torneo");
    } finally {
      setEliminando(null);
    }
  };

  if (!torneos || torneos.length === 0) return null;

  return (
    <div className="row">
      {torneos.map((torneo) => {
        const estado = ESTADOS[torneo.estadoTorneo] || {
          class: "bg-dark",
          text: torneo.estadoTorneo,
        };
        return (
          <div key={torneo.idTorneo} className="col-md-6 col-lg-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title text-dark">
                    {torneo.nombreTorneo}
                  </h5>
                  <span className={`badge ${estado.class}`}>{estado.text}</span>
                </div>
                <p className="text-muted small mb-2">
                  {torneo.fechaInicio} → {torneo.fechaTermino}
                </p>
                <p className="text-muted small mb-2">
                  Plazas: {torneo.nroPlazaActual ?? 0}/
                  {torneo.nroPlazaMax ?? "?"}
                </p>
                <button
                  className="btn btn-outline-dark btn-sm w-100 mb-1"
                  onClick={() => navigate(`/admin/torneos/${torneo.idTorneo}`)}
                >
                  Gestionar Torneo
                </button>
                {torneo.estadoTorneo === "NOT_STARTED" && (
                  <button
                    className="btn btn-outline-danger btn-sm w-100"
                    onClick={() => handleEliminar(torneo)}
                    disabled={eliminando === torneo.idTorneo}
                  >
                    {eliminando === torneo.idTorneo
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
