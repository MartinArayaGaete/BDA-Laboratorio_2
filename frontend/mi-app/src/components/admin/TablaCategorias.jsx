// src/components/admin/TablaCategorias.jsx
import React, { useState } from "react";
import categoriaService from "../../api/apiCategorias.js";

export default function TablaCategorias({ categorias, onCategoriaEliminada }) {
  const [eliminando, setEliminando] = useState(null);

  const handleEliminar = async (idCategoria, nombreCategoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombreCategoria}"?`)) return;

    setEliminando(idCategoria);
    try {
      await categoriaService.eliminarCategoria(idCategoria);
      if (onCategoriaEliminada) onCategoriaEliminada();
    } catch (err) {
      alert("Error al eliminar la categoría");
    } finally {
      setEliminando(null);
    }
  };

  if (!categorias || categorias.length === 0) return null;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th className="text-white" style={{ width: "80px" }}>
              ID
            </th>
            <th className="text-white">Nombre</th>
            <th className="text-white" style={{ width: "120px" }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.idCategoria}>
              <td className="text-muted">{categoria.idCategoria}</td>
              <td className="fw-bold">{categoria.nombreCategoria}</td>
              <td>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() =>
                    handleEliminar(
                      categoria.idCategoria,
                      categoria.nombreCategoria,
                    )
                  }
                  disabled={eliminando === categoria.idCategoria}
                >
                  {eliminando === categoria.idCategoria ? "..." : "Eliminar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
