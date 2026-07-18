import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TorneosListView() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarTorneos = () => {
    fetch("http://localhost:8080/api/torneos", { 
        method: "GET",
        credentials: "include", // 🪄 Enviamos la cookie de sesión del administrador
        headers: {
            "Content-Type": "application/json"
        }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar torneos");
        return res.json();
      })
      .then((data) => {
        setTorneos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarTorneos();
  }, []);

  // Función para llamar al endpoint de INICIAR torneo
  const handleIniciarTorneo = (idTorneo) => {
    if (!window.confirm("¿Estás seguro de iniciar el torneo? Ya no se aceptarán más inscritos.")) return;
    
    fetch(`http://localhost:8080/api/torneos/${idTorneo}/iniciar`, { 
        method: "POST",
        credentials: "include" // 🪄 Aquí enviamos la cookie de sesión del administrador
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorMsg = await res.text();
          throw new Error(errorMsg);
        }
        alert("Torneo iniciado con éxito.");
        cargarTorneos(); // Recargamos la tabla para ver el nuevo estado
      })
      .catch((err) => alert("Error: " + err.message));
  };

  // Función para llamar al endpoint de FINALIZAR torneo
  const handleFinalizarTorneo = (idTorneo) => {
    if (!window.confirm("¿Estás seguro de finalizar el torneo? Se calcularán las posiciones finales.")) return;

    fetch(`http://localhost:8080/api/torneos/${idTorneo}/finalizar`, { 
        method: "POST",
        credentials: "include" // 🪄 Aquí también enviamos la cookie de sesión
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorMsg = await res.text();
          throw new Error(errorMsg);
        }
        alert("Torneo finalizado con éxito.");
        cargarTorneos(); // Recargamos la tabla
      })
      .catch((err) => alert("Error: " + err.message));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "black", margin: 0 }}>🏆 Gestión de Torneos</h2>
        <button 
          className="btn btn-warning fw-bold" 
          onClick={() => navigate("/admin/torneos/crear")}
        >
          + Nuevo Torneo
        </button>
      </div>

      {loading && <div className="alert alert-info">⏳ Cargando torneos...</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}

      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Fechas (Inicio - Fin)</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones de Gestión</th>
                  </tr>
                </thead>
                <tbody>
                  {torneos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">No hay torneos registrados.</td>
                    </tr>
                  ) : (
                    torneos.map((torneo) => {
                      const id = torneo.id_torneo || torneo.idTorneo;
                      const estado = torneo.estado_torneo || torneo.estadoTorneo;
                      
                      return (
                        <tr key={id}>
                          <td>{id}</td>
                          <td className="fw-semibold">{torneo.nombre_torneo || torneo.nombreTorneo}</td>
                          <td>
                            {torneo.fecha_inicio || torneo.fechaInicio} a {torneo.fecha_termino || torneo.fechaTermino || "N/A"}
                          </td>
                          <td>
                            <span className={`badge ${
                              estado === 'NOT_STARTED' ? 'bg-secondary' : 
                              estado === 'ON_COURSE' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {estado}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group">
                              {/* Botón de Detalles (Siempre visible) */}
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/torneos/${id}`)}
                                title="Ver detalles y arqueros"
                              >
                                👁️ Detalles
                              </button>

                              {/* Botón de Iniciar: Solo si no ha empezado */}
                              {estado === 'NOT_STARTED' && (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleIniciarTorneo(id)}
                                >
                                  ▶️ Iniciar
                                </button>
                              )}

                              {/* Botón de Finalizar: Solo si está en curso */}
                              {estado === 'ON_COURSE' && (
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleFinalizarTorneo(id)}
                                >
                                  ⏹️ Finalizar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}