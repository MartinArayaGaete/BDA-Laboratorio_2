// src/components/admin/TablaUsuarios.jsx
import React from "react";

export default function TablaUsuarios({ usuarios }) {
  if (!usuarios || usuarios.length === 0) return null;

  return (
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
              <td>{usuario.idUsuario}</td>
              <td>
                <code>{usuario.rut}</code>
              </td>
              <td className="fw-bold">{usuario.nombre}</td>
              <td>{usuario.correo}</td>
              <td>
                <span
                  className={`badge ${usuario.rol === "ADMIN" ? "bg-danger" : "bg-primary"}`}
                >
                  {usuario.rol}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-secondary me-1"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
