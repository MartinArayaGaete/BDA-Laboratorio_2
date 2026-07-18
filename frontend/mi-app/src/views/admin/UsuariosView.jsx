import React, { useState, useEffect, useCallback } from "react";
import usuarioService from "../../api/apiUsuarios.js";
import TablaUsuarios from "../../components/admin/TablaUsuarios.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarUsuarios = useCallback(() => {
    setLoading(true);
    setError("");
    usuarioService
      .obtenerTodos()
      .then((data) => {
        setUsuarios(data);
      })
      .catch((err) => {
        setError("Error al cargar usuarios");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  if (loading) return <LoadingSpinner message="Cargando usuarios..." />;

  return (
    <div>
      <h2 className="mb-4 text-dark">Gestión de Usuarios</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {usuarios.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No hay usuarios"
          message="No se encontraron usuarios registrados"
        />
      ) : (
        <TablaUsuarios
          usuarios={usuarios}
          onUsuarioActualizado={cargarUsuarios}
        />
      )}
    </div>
  );
}
