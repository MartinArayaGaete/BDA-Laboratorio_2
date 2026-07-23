import React, { useState } from "react";
import categoriaService from "../../api/apiCategorias.js";

export default function TablaCategorias({
  categorias,
  onCategoriaActualizada,
}) {
  const [eliminando, setEliminando] = useState(null);
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombreCategoria: "",
    distanciaTiro: "",
  });
  const [guardando, setGuardando] = useState(false);

  const abrirEditar = (categoria) => {
    setEditando(categoria);
    setFormData({
      nombreCategoria: categoria.nombreCategoria,
      distanciaTiro: categoria.distanciaTiro ?? "",
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(null);
  };

  const handleGuardar = async () => {
    if (!formData.nombreCategoria.trim()) {
      alert("El nombre de la categoría es obligatorio");
      return;
    }

    const distanciaNumerica =
      formData.distanciaTiro === "" || formData.distanciaTiro === null
        ? null
        : Number(formData.distanciaTiro);

    setGuardando(true);
    try {
      await categoriaService.actualizarCategoria(editando.idCategoria, {
        nombreCategoria: formData.nombreCategoria.trim(),
        distanciaTiro: distanciaNumerica,
      });
      cerrarModal();
      if (onCategoriaActualizada) onCategoriaActualizada();
    } catch (err) {
      alert("Error al actualizar la categoría");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (idCategoria, nombreCategoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombreCategoria}"?`)) return;
    setEliminando(idCategoria);
    try {
      await categoriaService.eliminarCategoria(idCategoria);
      if (onCategoriaActualizada) onCategoriaActualizada();
    } catch (err) {
      alert("Error al eliminar la categoría");
    } finally {
      setEliminando(null);
    }
  };

  if (!categorias || categorias.length === 0) return null;

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th className="text-white" style={{ width: "80px" }}>
                ID
              </th>
              <th className="text-white">Nombre</th>
              <th className="text-white">Distancia (m)</th>
              <th className="text-white" style={{ width: "150px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.idCategoria}>
                <td className="text-muted">{categoria.idCategoria}</td>
                <td className="fw-bold">{categoria.nombreCategoria}</td>
                <td className="text-muted">
                  {categoria.distanciaTiro == null
                    ? "—"
                    : `${categoria.distanciaTiro} m`}
                </td>
                <td>
                  <button
                    className="btn btn-outline-dark btn-sm me-1"
                    onClick={() => abrirEditar(categoria)}
                  >
                    Editar
                  </button>
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

      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Editar Categoría</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombreCategoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombreCategoria: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Distancia de Tiro (m)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    value={formData.distanciaTiro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distanciaTiro: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-dark" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button
                  className="btn btn-dark"
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
