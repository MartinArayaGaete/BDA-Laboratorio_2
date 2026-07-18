import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import arquerosService from "../../api/apiArqueros.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function HistorialView() {
  const { user } = useAuth();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    if (user?.idUsuario) {
      cargarHistorial();
    }
  }, [user, page]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await arquerosService.obtenerHistorial(
        user.idUsuario,
        page,
        pageSize,
      );
      // El backend devuelve: { torneos: [...], page, size, totalElements, totalPages }
      setHistorial(data);
    } catch (err) {
      setError("Error al cargar el historial");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      NOT_STARTED: { class: "bg-secondary", text: "No Iniciado" },
      IN_COURSE: { class: "bg-primary", text: "En Curso" },
      COMPLETED: { class: "bg-success", text: "Finalizado" },
    };
    const config = estados[estado] || { class: "bg-dark", text: estado };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading && !historial)
    return <LoadingSpinner message="Cargando historial..." />;

  if (error) {
    return (
      <div>
        <h2 className="mb-4 text-dark">Mi Historial</h2>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-outline-primary" onClick={cargarHistorial}>
          Reintentar
        </button>
      </div>
    );
  }

  // El DTO HistorialArqueroResponse tiene: torneos, page, size, totalElements, totalPages
  const torneos = historial?.torneos || [];
  const totalPages = historial?.totalPages || 0;
  const totalElements = historial?.totalElements || 0;

  return (
    <div>
      <h2 className="mb-4 text-dark">Mi Historial</h2>

      <p className="text-muted">
        Total de torneos participados: <strong>{totalElements}</strong>
      </p>

      {torneos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>Aún no has participado en ningún torneo</p>
        </div>
      ) : (
        <>
          {torneos.map((torneo, index) => (
            <div key={torneo.idTorneo || index} className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{torneo.nombreTorneo}</h5>
                  {getEstadoBadge(torneo.estadoTorneo)}
                </div>
                <small className="text-muted">{torneo.fechaInicio}</small>
              </div>
              <div className="card-body">
                <div className="row mb-3 text-center">
                  <div className="col-4">
                    <h4 className="text-primary">{torneo.puntajeFinal || 0}</h4>
                    <small className="text-muted">Puntaje Final</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-success">
                      {torneo.posicionFinal
                        ? `#${torneo.posicionFinal}`
                        : "N/A"}
                    </h4>
                    <small className="text-muted">Posición</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-warning">
                      {torneo.rondas?.length || 0}
                    </h4>
                    <small className="text-muted">Rondas</small>
                  </div>
                </div>

                {torneo.rondas && torneo.rondas.length > 0 && (
                  <div className="mt-3">
                    <h6>Detalle por Ronda</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Ronda</th>
                            <th>Puntaje</th>
                            <th>Flechas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {torneo.rondas.map((ronda, i) => (
                            <tr key={i}>
                              <td>Ronda {ronda.numeroRonda}</td>
                              <td className="fw-bold">
                                {ronda.puntajeRonda || 0}
                              </td>
                              <td>
                                {ronda.flechas?.map((f, j) => (
                                  <span
                                    key={j}
                                    className="badge bg-secondary me-1"
                                  >
                                    {f.puntaje}
                                  </span>
                                )) || "Sin datos"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-outline-primary"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Anterior
              </button>
              <span className="btn btn-outline-secondary disabled">
                Página {page + 1} de {totalPages}
              </span>
              <button
                className="btn btn-outline-primary"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
