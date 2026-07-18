import React, { useState, useEffect } from "react";
import apiLogs from "../../api/apiLogs.js";
import TablaLogs from "../../components/admin/TablaLogs.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function LogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const cargarLogs = () => {
    setLoading(true);
    setError("");

    apiLogs
      .obtenerAuditoria(page, 10)
      .then((data) => {
        if (data && data.logs) {
          setLogs(data.logs);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else if (Array.isArray(data)) {
          setLogs(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setLogs([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      })
      .catch((err) => {
        console.error("Error al cargar logs:", err);
        setError("Error al cargar los registros de auditoría");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarLogs();
  }, [page]);

  if (loading) return <LoadingSpinner message="Cargando auditoría..." />;

  return (
    <div>
      <h2 className="mb-4 text-dark">Registros de Auditoría</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      <p className="text-muted">
        Total de registros: <strong>{totalElements}</strong>
      </p>

      {logs.length === 0 && !loading ? (
        <div className="text-center py-5 text-muted">
          <p>No hay registros de auditoría disponibles</p>
          <small>
            Los registros se generan cuando un administrador modifica puntajes.
          </small>
        </div>
      ) : (
        <>
          <TablaLogs logs={logs} />

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
