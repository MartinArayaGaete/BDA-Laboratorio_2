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
      <h2 className="mb-4" color="black">
        Dashboard Administrador
      </h2>

      <StatsCards stats={stats} />

      <div className="row g-3 mt-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>🚀 Acciones Rápidas</h5>
              <div className="d-grid gap-2 mt-3">
                <button
                  className="btn btn-dark"
                  onClick={() => navigate("/admin/torneos/crear")}
                >
                  ➕ Crear Nuevo Torneo
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/admin/torneos")}
                >
                  📋 Ver Todos los Torneos
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => navigate("/admin/usuarios")}
                >
                  👥 Gestionar Usuarios
                </button>
                <button
                  className="btn btn-outline-warning"
                  onClick={() => navigate("/admin/logs")}
                >
                  📊 Ver Auditoría
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>ℹ️ Resumen del Sistema</h5>
              <ul className="list-group list-group-flush mt-3">
                <li className="list-group-item d-flex justify-content-between">
                  Torneos Totales{" "}
                  <span className="badge bg-primary">{stats.totalTorneos}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  En Curso{" "}
                  <span className="badge bg-warning text-dark">
                    {stats.torneosActivos}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  Usuarios{" "}
                  <span className="badge bg-success">
                    {stats.totalUsuarios}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  Auditoría{" "}
                  <span className="badge bg-info">{stats.totalLogs}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
