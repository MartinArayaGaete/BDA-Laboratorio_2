import React, { useState, useEffect } from "react";
import usuarioService from "../../api/apiUsuarios.js";
import TablaUsuarios from "../../components/admin/TablaUsuarios.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    usuarioService
      .obtenerTodos()
      .then(setUsuarios)
      .catch((err) => {
        setError("Error al cargar usuarios");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Cargando usuarios..." />;

  return (
    <div>
      <h2 className="mb-4" color="black">
        👥 Gestión de Usuarios
      </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {usuarios.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No hay usuarios"
          message="No se encontraron usuarios registrados"
        />
      ) : (
        <TablaUsuarios usuarios={usuarios} />
      )}
    </div>
  );
}
