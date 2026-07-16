// src/views/archer/DashboardView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import arquerosService from "../../api/apiArqueros.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function DashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (user?.idUsuario) {
          const [stats, hist] = await Promise.all([
            arquerosService
              .obtenerHistorial(user.idUsuario, 0, 1)
              .catch(() => null),
            arquerosService
              .obtenerEstadisticas?.(user.idUsuario)
              .catch(() => null),
          ]);
          setEstadisticas(stats);
          setHistorial(hist);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user]);

  if (loading) return <LoadingSpinner message="Cargando panel..." />;

  const totalTorneos = estadisticas?.totalElements || 0;
  const ultimoTorneo = estadisticas?.content?.[0];

  return (
    <div>
      <h2 className="mb-4 text-dark">Mi Panel de Arquero</h2>

      {/* Tarjetas de resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body text-center">
              <h3 className="mt-2">{totalTorneos}</h3>
              <p className="mb-0">Torneos Participados</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body text-center">
              <h3 className="mt-2">
                {historial?.promedioPuntos
                  ? Number(historial.promedioPuntos).toFixed(1)
                  : "--"}
              </h3>
              <p className="mb-0">Promedio Puntos/Flecha</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body text-center">
              <h3 className="mt-2">
                {ultimoTorneo?.posicionFinal
                  ? `#${ultimoTorneo.posicionFinal}`
                  : "--"}
              </h3>
              <p className="mb-0">Última Posición</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5>Acciones Rápidas</h5>
              <div className="d-grid gap-2 mt-3">
                <button
                  className="btn btn-dark"
                  onClick={() => navigate("/archer/torneos")}
                >
                  Ver Torneos Disponibles
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/archer/historial")}
                >
                  Ver Mi Historial
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5>Información Personal</h5>
              <table className="table table-sm mt-3">
                <tbody>
                  <tr>
                    <td className="text-muted">Nombre</td>
                    <td className="fw-bold">{user?.nombre}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">RUT</td>
                    <td>
                      <code>{user?.rut}</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Email</td>
                    <td>{user?.correo || "No registrado"}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Rol</td>
                    <td>
                      <span className="badge bg-primary">{user?.rol}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Último torneo */}
      {ultimoTorneo && (
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-light">
            <strong>Último Torneo</strong>
          </div>
          <div className="card-body">
            <h5>{ultimoTorneo.nombreTorneo}</h5>
            <div className="row">
              <div className="col-md-3 text-center">
                <h4 className="text-primary">
                  {ultimoTorneo.puntajeFinal || 0}
                </h4>
                <small className="text-muted">Puntaje Final</small>
              </div>
              <div className="col-md-3 text-center">
                <h4 className="text-success">
                  {ultimoTorneo.posicionFinal
                    ? `#${ultimoTorneo.posicionFinal}`
                    : "N/A"}
                </h4>
                <small className="text-muted">Posición</small>
              </div>
              <div className="col-md-3 text-center">
                <h4 className="text-warning">
                  {ultimoTorneo.rondas?.length || 0}
                </h4>
                <small className="text-muted">Rondas</small>
              </div>
              <div className="col-md-3 text-center">
                <span
                  className={`badge ${
                    ultimoTorneo.estadoTorneo === "COMPLETED"
                      ? "bg-success"
                      : ultimoTorneo.estadoTorneo === "IN_COURSE"
                        ? "bg-primary"
                        : "bg-secondary"
                  }`}
                >
                  {ultimoTorneo.estadoTorneo}
                </span>
                <br />
                <small className="text-muted">Estado</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
