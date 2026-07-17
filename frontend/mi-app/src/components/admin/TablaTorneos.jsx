// src/components/admin/TablaTorneos.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ESTADOS = {
  NOT_STARTED: { class: "bg-secondary", text: "No Iniciado" },
  IN_COURSE: { class: "bg-primary", text: "En Curso" },
  COMPLETED: { class: "bg-success", text: "Finalizado" },
};

export default function TablaTorneos({ torneos }) {
  const navigate = useNavigate();

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
                  📅 {torneo.fechaInicio} → {torneo.fechaTermino}
                </p>
                <button
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => navigate(`/admin/torneos/${torneo.idTorneo}`)}
                >
                  👁 Gestionar Torneo
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
