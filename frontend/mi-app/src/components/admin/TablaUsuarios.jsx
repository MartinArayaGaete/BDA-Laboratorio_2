import React, { useState } from "react";
import usuarioService from "../../api/apiUsuarios.js";

export default function TablaUsuarios({ usuarios, onUsuarioActualizado }) {
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
  });

  if (!usuarios || usuarios.length === 0) return null;

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
    });
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setUsuarioEditando(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError("");
    try {
      await usuarioService.actualizarUsuario(usuarioEditando.rut, {
        nombre: formData.nombre,
        correo: formData.correo,
        rol: usuarioEditando.rol,
      });
      cerrarModal();
      if (onUsuarioActualizado) onUsuarioActualizado();
    } catch (err) {
      setError("Error al actualizar el usuario");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (usuario) => {
    if (!window.confirm(`¿Eliminar a ${usuario.nombre}?`)) return;
    try {
      await usuarioService.eliminarUsuario(usuario.rut);
      if (onUsuarioActualizado) onUsuarioActualizado();
    } catch (err) {
      setError("Error al eliminar el usuario");
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th className="text-white">ID</th>
              <th className="text-white">RUT</th>
              <th className="text-white">Nombre</th>
              <th className="text-white">Email</th>
              <th className="text-white">Rol</th>
              <th className="text-white">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.idUsuario}>
                <td className="text-dark">{usuario.idUsuario}</td>
                <td>
                  <code className="text-dark">{usuario.rut}</code>
                </td>
                <td className="fw-bold text-dark">{usuario.nombre}</td>
                <td className="text-dark">{usuario.correo}</td>
                <td>
                  <span
                    className={`badge ${usuario.rol === "ADMIN" ? "bg-dark text-white" : "bg-secondary text-white"}`}
                  >
                    {usuario.rol}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-dark me-1"
                    title="Editar"
                    onClick={() => abrirModalEditar(usuario)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Eliminar"
                    onClick={() => handleEliminar(usuario)}
                  >
                    Eliminar
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
                <h5 className="modal-title">Editar Usuario</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">RUT</label>
                  <input
                    type="text"
                    className="form-control"
                    value={usuarioEditando?.rut || ""}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
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
