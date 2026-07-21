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

    const distanciaNumerica = distanciaTiro.trim() === "" ? null : Number(distanciaTiro);

    if (distanciaTiro.trim() !== "" && (!Number.isInteger(distanciaNumerica) || distanciaNumerica < 0)) {
      setError("La distancia de tiro debe ser un número entero mayor o igual a 0");
      return;
    }

    setGuardando(true);
    try {
      await categoriaService.crearCategoria({
        nombreCategoria: nombreCategoria.trim(),
        distanciaTiro: distanciaNumerica,
      });

      const mensajeDistancia = distanciaNumerica === null ? "" : ` con distancia de tiro de ${distanciaNumerica} m`;
      setSuccess(`Categoría "${nombreCategoria.trim()}" creada exitosamente${mensajeDistancia}`);
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
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Recurvo, Compuesto, Tradicional"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
              disabled={guardando}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Distancia de tiro (m)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="1"
              placeholder="Ej: 70"
              value={distanciaTiro}
              onChange={(e) => setDistanciaTiro(e.target.value)}
              disabled={guardando}
            />
          </div>
          <div className="col-md-3">
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
