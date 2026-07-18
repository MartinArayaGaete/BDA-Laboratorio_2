import React from "react";

export default function TablaLogs({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm align-middle">
        <thead className="table-dark">
          <tr>
            <th className="text-white">ID</th>
            <th className="text-white">Admin</th>
            <th className="text-white">Afectado</th>
            <th className="text-white">Torneo</th>
            <th className="text-white">Ronda</th>
            <th className="text-white">Puntaje Ant.</th>
            <th className="text-white">Puntaje Nuevo</th>
            <th className="text-white">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.idLog}>
              <td className="text-dark">{log.idLog}</td>
              <td className="text-nowrap text-dark">
                {log.nombreAdmin || "N/A"}
              </td>
              <td className="text-nowrap text-dark">
                {log.nombreAfectado || "N/A"}
              </td>
              <td className="text-nowrap text-dark">
                {log.nombreTorneo || "N/A"}
              </td>
              <td className="text-dark">{log.numeroRonda ?? "N/A"}</td>
              <td className="text-dark">{log.puntajeAnterior ?? "N/A"}</td>
              <td className="fw-bold text-dark">{log.puntajeNuevo ?? "N/A"}</td>
              <td className="text-nowrap text-dark">
                <small>
                  {log.fechaEditado
                    ? new Date(log.fechaEditado).toLocaleString()
                    : "N/A"}
                </small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
