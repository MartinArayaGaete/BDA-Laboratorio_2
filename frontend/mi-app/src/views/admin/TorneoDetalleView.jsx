import React from "react";
import { useParams } from "react-router-dom";

export default function TorneoDetalleView() {
  // Extraemos el ID de la URL automáticamente
  const { idTorneo } = useParams();

  return (
    <div>
      <h2 className="mb-4" style={{ color: "black" }}>
        📊 Detalles del Torneo #{idTorneo}
      </h2>
      <div className="alert alert-info">
        Vista en construcción. Aquí se mostrarán los datos y el ranking del torneo {idTorneo} más adelante.
      </div>
    </div>
  );
}