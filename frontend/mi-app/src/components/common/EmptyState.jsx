import React from "react";

export default function EmptyState({
  title = "No hay datos",
  message = "No se encontraron registros para mostrar.",
  actionLabel = "",
  onAction = null,
}) {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: "3rem" }}>{}</div>
      <h4 className="mt-3 text-muted">{title}</h4>
      <p className="text-muted">{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary mt-2" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
