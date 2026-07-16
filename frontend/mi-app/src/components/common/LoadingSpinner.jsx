import React from "react";

export default function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );
}
