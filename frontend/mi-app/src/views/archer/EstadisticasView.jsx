import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import arquerosService from "../../api/apiArqueros.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function EstadisticasView() {
  const { user } = useAuth();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarEstadisticas = async () => {
    if (!user?.idUsuario) return;

    try {
      setLoading(true);
      setError("");
      const data = await arquerosService.obtenerEstadisticas(user.idUsuario);
      setEstadisticas(data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      if (err.response?.status === 404) {
        setEstadisticas({
          torneosTotales: 0,
          totalFlechas: 0,
          flechasAcertadas: 0,
          porcentajeAcierto: 0,
          totalPuntos: 0,
          promedioPuntos: 0,
        });
      } else {
        setError("Error al cargar las estadísticas");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, [user]);

  if (loading) return <LoadingSpinner message="Cargando estadísticas..." />;

  if (error) {
    return (
      <div>
        <h2 className="mb-4 text-dark">Mis Estadísticas</h2>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-outline-dark" onClick={cargarEstadisticas}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-dark">Mis Estadísticas</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-dark shadow-sm">
            <div className="card-body text-center py-4">
              <h2 className="text-white">
                {estadisticas?.torneosTotales || 0}
              </h2>
              <p className="mb-0 text-white-50">Torneos Totales</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-dark shadow-sm">
            <div className="card-body text-center py-4">
              <h2 className="text-white">{estadisticas?.totalFlechas || 0}</h2>
              <p className="mb-0 text-white-50">Flechas Lanzadas</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-dark shadow-sm">
            <div className="card-body text-center py-4">
              <h2 className="text-white">
                {estadisticas?.porcentajeAcierto || 0}%
              </h2>
              <p className="mb-0 text-white-50">Precisión</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm bg-white">
            <div className="card-body text-center py-4">
              <h3 className="text-dark">{estadisticas?.totalPuntos || 0}</h3>
              <p className="text-dark mb-0">Puntos Totales</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm bg-white">
            <div className="card-body text-center py-4">
              <h3 className="text-dark">
                {estadisticas?.promedioPuntos != null
                  ? Number(estadisticas.promedioPuntos).toFixed(2)
                  : "0.00"}
              </h3>
              <p className="text-dark mb-0">Promedio por Flecha</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm bg-white">
            <div className="card-body text-center py-4">
              <h3 className="text-dark">
                {estadisticas?.flechasAcertadas || 0}
              </h3>
              <p className="text-dark mb-0">Flechas con Puntaje</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm bg-white">
        <div className="card-body">
          <h5 className="text-dark">Precisión General</h5>
          <div className="progress" style={{ height: "30px" }}>
            <div
              className="progress-bar bg-dark fw-bold"
              role="progressbar"
              style={{ width: `${estadisticas?.porcentajeAcierto || 0}%` }}
            >
              {estadisticas?.porcentajeAcierto || 0}%
            </div>
          </div>
          <small className="text-dark mt-2 d-block">
            {estadisticas?.flechasAcertadas || 0} de{" "}
            {estadisticas?.totalFlechas || 0} flechas acertadas (
            {estadisticas?.totalPuntos || 0} puntos totales)
          </small>
        </div>
      </div>
    </div>
  );
}
