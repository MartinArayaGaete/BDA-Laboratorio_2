import React from "react";

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Torneos Activos",
      value: stats.torneosActivos,
      subtitle: `de ${stats.totalTorneos} totales`,
    },
    {
      title: "Usuarios",
      value: stats.totalUsuarios,
      subtitle: "registrados",
    },
    {
      title: "Categorías",
      value: stats.totalCategorias,
      subtitle: "disponibles",
    },
    {
      title: "Auditoría",
      value: stats.totalLogs,
      subtitle: "registros",
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((card, index) => (
        <div key={index} className="col-md-3">
          <div className="card bg-dark shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-white mb-0">{card.title}</h6>
                  <h2 className="mt-2 mb-0 text-white">{card.value}</h2>
                </div>
              </div>
              {card.subtitle && (
                <small className="text-white">{card.subtitle}</small>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
