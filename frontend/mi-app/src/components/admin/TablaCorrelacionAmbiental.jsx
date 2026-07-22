import React, { useState, useEffect } from "react";
import estadisticasService from "../../api/apiEstadisticas.js";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

export default function TablaCorrelacionAmbiental() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await estadisticasService.obtenerCorrelacionAmbiental();
        setData(result);
      } catch (err) {
        console.error("Error al cargar correlación ambiental:", err);
        setError("No se pudieron cargar los datos de correlación.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Cargando estadísticas..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card shadow-sm bg-white">
      <div className="card-body">
        <h5 className="text-dark mb-3">Correlación Ambiental</h5>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>Condición</th>
                <th>Total Flechas</th>
                <th>Promedio</th>
                <th>Desviación</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.condicionClimatica}</td>
                  <td>{item.totalFlechas}</td>
                  <td>{item.promedioPuntaje.toFixed(2)}</td>
                  <td>{item.desviacionPrecision.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
