import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";
import usuarioService from "../../api/apiUsuarios.js";
import categoriaService from "../../api/apiCategorias.js";
import logsService from "../../api/apiLogs.js";
import StatsCards from "../../components/admin/StatsCards.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function DashboardView() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [torneos, usuarios, categorias, logs] = await Promise.all([
          torneoService.obtenerTodos().catch(() => []),
          usuarioService.obtenerTodos().catch(() => []),
          categoriaService.obtenerTodas().catch(() => []),
          logsService
            .obtenerAuditoria(0, 1)
            .catch(() => ({ totalElements: 0 })),
        ]);

        setStats({
          torneosActivos: torneos.filter((t) => t.estadoTorneo === "IN_COURSE")
            .length,
          totalTorneos: torneos.length,
          totalUsuarios: usuarios.length,
          totalCategorias: categorias.length,
          totalLogs: logs.totalElements || 0,
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (loading) return <LoadingSpinner message="Cargando dashboard..." />;
  if (!stats) return null;

  return (
    <div>
      <h2 className="mb-4 text-dark">Resumen</h2>

      <StatsCards stats={stats} />

      <div className="row g-3 mt-4">
        <div className="col-md-6">
          <div className="card shadow-sm bg-white">
            <div className="card-body">
              <h5 className="text-dark">Acciones Rápidas</h5>
              <div className="d-grid gap-2 mt-3">
                <button
                  className="btn btn-dark"
                  onClick={() => navigate("/admin/torneos/crear")}
                >
                  Crear Nuevo Torneo
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => navigate("/admin/torneos")}
                >
                  Ver Todos los Torneos
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => navigate("/admin/usuarios")}
                >
                  Gestionar Usuarios
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => navigate("/admin/logs")}
                >
                  Ver Auditoría
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm bg-white">
            <div className="card-body">
              <h5 className="text-dark">Resumen del Sistema</h5>
              <ul className="list-group list-group-flush mt-3">
                <li className="list-group-item d-flex justify-content-between text-dark">
                  Torneos Totales{" "}
                  <span className="badge bg-dark text-white">
                    {stats.totalTorneos}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between text-dark">
                  En Curso{" "}
                  <span className="badge bg-dark text-white">
                    {stats.torneosActivos}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between text-dark">
                  Usuarios{" "}
                  <span className="badge bg-dark text-white">
                    {stats.totalUsuarios}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between text-dark">
                  Auditoría{" "}
                  <span className="badge bg-dark text-white">
                    {stats.totalLogs}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
