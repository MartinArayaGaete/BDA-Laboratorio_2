import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";
import TablaTorneos from "../../components/admin/TablaTorneos.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function TorneosListView() {
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarTorneos = useCallback(() => {
    setLoading(true);
    setError("");
    torneoService
      .obtenerTodos()
      .then((data) => setTorneos(data))
      .catch((err) => {
        setError("Error al cargar torneos");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargarTorneos();
  }, [cargarTorneos]);

  if (loading) return <LoadingSpinner message="Cargando torneos..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark">Gestión de Torneos</h2>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => navigate("/admin/torneos/crear")}
        >
          ➕ Nuevo Torneo
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {torneos.length === 0 ? (
        <EmptyState
          title="No hay torneos"
          message="Crea tu primer torneo para comenzar"
          actionLabel="Crear Torneo"
          onAction={() => navigate("/admin/torneos/crear")}
        />
      ) : (
        <TablaTorneos torneos={torneos} onTorneoActualizado={cargarTorneos} />
      )}
    </div>
  );
}
