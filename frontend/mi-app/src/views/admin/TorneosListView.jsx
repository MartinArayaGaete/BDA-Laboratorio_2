import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    torneoService
      .obtenerTodos()
      .then(setTorneos)
      .catch((err) => {
        setError("Error al cargar torneos");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Cargando torneos..." />;

  return (
    <div>
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        color="black"
      >
        <h2>🏆 Gestión de Torneos</h2>
        <button
          className="btn btn-dark"
          onClick={() => navigate("/admin/torneos/crear")}
        >
          ➕ Nuevo Torneo
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {torneos.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="No hay torneos"
          message="Crea tu primer torneo para comenzar"
          actionLabel="Crear Torneo"
          onAction={() => navigate("/admin/torneos/crear")}
        />
      ) : (
        <TablaTorneos torneos={torneos} />
      )}
    </div>
  );
}
