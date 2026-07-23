import React, { useState } from "react";
import categoriaService from "../../api/apiCategorias.js";

export default function FormCategoria({ onCategoriaCreada }) {
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [distanciaTiro, setDistanciaTiro] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nombreCategoria.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    setGuardando(true);
    try {
      await categoriaService.crearCategoria({
        nombreCategoria: nombreCategoria.trim(),
        distanciaTiro: distanciaTiro ? parseInt(distanciaTiro) : null,
      });
      setSuccess(`Categoría "${nombreCategoria.trim()}" creada exitosamente`);
      setNombreCategoria("");
      setDistanciaTiro("");
      if (onCategoriaCreada) onCategoriaCreada();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la categoría");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <strong>Nueva Categoría</strong>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Recurvo"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
              disabled={guardando}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Distancia (m)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ej: 18"
              value={distanciaTiro}
              onChange={(e) => setDistanciaTiro(e.target.value)}
              disabled={guardando}
            />
          </div>
          <div className="col-md-4">
            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={guardando || !nombreCategoria.trim()}
            >
              {guardando ? "Creando..." : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
