import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TorneoDetalleView() {
  const { idTorneo } = useParams();
  const navigate = useNavigate();
  
  // Estados para el Torneo
  const [torneo, setTorneo] = useState(null);
  const [loadingTorneo, setLoadingTorneo] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los Arqueros Inscritos
  const [inscritos, setInscritos] = useState([]);
  const [loadingInscritos, setLoadingInscritos] = useState(true);

  // Función para recargar todo el contenido de la vista
  const cargarTodo = () => {
    setLoadingTorneo(true);
    // 1. Llamada para obtener los detalles del torneo
    fetch(`http://localhost:8080/api/torneos/${idTorneo}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los detalles del torneo");
        return res.json();
      })
      .then((data) => {
        setTorneo(data);
        setLoadingTorneo(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingTorneo(false);
      });

    // 2. Llamada para obtener los arqueros inscritos
    fetch(`http://localhost:8080/api/participaciones/torneo/${idTorneo}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => {
        if (res.status === 204) return [];
        if (!res.ok) throw new Error("Error al cargar los inscritos");
        return res.json();
      })
      .then((data) => {
        setInscritos(data);
        setLoadingInscritos(false);
      })
      .catch((err) => {
        console.error("Error cargando inscritos:", err);
        setLoadingInscritos(false);
      });
  };

  useEffect(() => {
    cargarTodo();
  }, [idTorneo]);

  // Función para llamar al endpoint de FINALIZAR torneo
  const handleFinalizarTorneo = () => {
    if (!window.confirm("¿Estás seguro de finalizar el torneo? Se calcularán las posiciones finales.")) return;

    fetch(`http://localhost:8080/api/torneos/${idTorneo}/finalizar`, { 
        method: "POST",
        credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorMsg = await res.text();
          throw new Error(errorMsg);
        }
        alert("Torneo finalizado con éxito.");
        cargarTodo(); // Recargamos la vista actual para ver el cambio de estado
      })
      .catch((err) => alert("Error: " + err.message));
  };

  const estado = torneo ? (torneo.estado_torneo || torneo.estadoTorneo) : "";

  return (
    <div>
      {/* Cabecera con botón de volver */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "black", margin: 0 }}>📊 Detalles del Torneo #{idTorneo}</h2>
        <button 
          className="btn btn-secondary fw-bold" 
          onClick={() => navigate("/admin/torneos")}
        >
          ⬅ Volver a la lista
        </button>
      </div>

      {loadingTorneo && <div className="alert alert-info">⏳ Cargando detalles...</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}

      {!loadingTorneo && !error && torneo && (
        <>
          {/* Tarjeta de Información General */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Información General</h5>
              
              {/* BOTÓN DE FINALIZAR DINÁMICO */}
              {estado === 'IN_COURSE' && (
                <button 
                  className="btn btn-sm btn-danger fw-bold"
                  onClick={handleFinalizarTorneo}
                >
                  ⏹️ Finalizar Torneo
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Nombre del Torneo</p>
                  <h5 className="fw-semibold">{torneo.nombre_torneo || torneo.nombreTorneo}</h5>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Estado</p>
                  <span className={`badge fs-6 ${
                    estado === 'NOT_STARTED' ? 'bg-secondary' : 
                    estado === 'IN_COURSE' ? 'bg-success' : 'bg-danger'
                  }`}>
                    {estado}
                  </span>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Fecha de Inicio</p>
                  <p className="fw-medium">{torneo.fecha_inicio || torneo.fechaInicio}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Fecha de Término</p>
                  <p className="fw-medium">{torneo.fecha_termino || torneo.fechaTermino || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Participantes */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🏹 Arqueros Inscritos</h5>
              <span className="badge bg-dark text-white">{inscritos.length} inscritos</span>
            </div>
            
            <div className="card-body p-0">
              {loadingInscritos ? (
                <div className="p-4 text-center text-muted">Cargando arqueros...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID Usuario</th>
                        <th>RUT</th>
                        <th>Nombre</th>
                        <th>Ubic. Arquero</th>
                        <th>Ubic. Blanco</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscritos.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            No hay arqueros inscritos en este torneo aún.
                          </td>
                        </tr>
                      ) : (
                        inscritos.map((arquero) => (
                          <tr key={arquero.idParticipacion}>
                            <td className="fw-medium text-muted">#{arquero.idUsuario}</td>
                            <td>{arquero.rut}</td>
                            <td className="fw-semibold">{arquero.nombre}</td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {arquero.ubicacionArquero || "-"}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {arquero.ubicacionBlanco || "-"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}