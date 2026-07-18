import React from "react";

export default function Podio({ podio }) {
  if (!podio || podio.length === 0) return null;

  const medallas = ["🥇", "🥈", "🥉"];

  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="card shadow-sm border-0 bg-dark p-4 rounded-3">
          <h4 className="text-center mb-4 text-warning">Podio de Ganadores</h4>
          <div className="d-flex flex-wrap justify-content-around text-center gap-3">
            {podio.slice(0, 3).map((p, idx) => (
              <div
                key={p.idUsuario}
                className="px-3 py-2 rounded border border-secondary"
                style={{
                  minWidth: "200px",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <h2 className="display-4 mb-2">{medallas[idx]}</h2>
                <h5
                  className="fw-bold mb-1 text-white"
                  style={{ maxWidth: "180px" }}
                >
                  {p.nombre}
                </h5>
                <p className="small text-warning fw-bold mb-1">
                  Lugar {idx + 1}
                </p>
                <p className="small text-white-50 mb-0">{p.rut}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
