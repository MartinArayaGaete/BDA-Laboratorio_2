import React from "react";

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Torneos Activos",
      value: stats.torneosActivos,
      subtitle: `de ${stats.totalTorneos} totales`,
      icon: "🏆",
      color: "primary",
    },
    {
      title: "Usuarios",
      value: stats.totalUsuarios,
      subtitle: "registrados",
      icon: "👥",
      color: "success",
    },
    {
      title: "Categorías",
      value: stats.totalCategorias,
      subtitle: "disponibles",
      icon: "📑",
      color: "warning",
    },
    {
      title: "Auditoría",
      value: stats.totalLogs,
      subtitle: "registros",
      icon: "📋",
      color: "info",
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((card, index) => (
        <div key={index} className="col-md-3">
          <div className={`card bg-${card.color} text-white shadow-sm h-100`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0 opacity-75">{card.title}</h6>
                  <h2 className="mt-2 mb-0">{card.value}</h2>
                </div>
                <span style={{ fontSize: "2rem" }}>{card.icon}</span>
              </div>
              {card.subtitle && (
                <small className="opacity-75">{card.subtitle}</small>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
