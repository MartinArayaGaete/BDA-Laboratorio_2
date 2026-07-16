import React from "react";

export default function FormularioFlechas({
  torneo,
  usuarioSel,
  rondas,
  rondaSel,
  setRondaSel,
  flechas,
  setFlechas,
  guardandoPuntaje,
  onGuardarPuntaje,
}) {
  // Si el torneo no ha empezado
  if (torneo.estadoTorneo === "NOT_STARTED") {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5>🏹 Torneo en Espera</h5>
          <p className="text-muted">Inicia el torneo para gestionar puntajes</p>
        </div>
      </div>
    );
  }

  // Si el torneo terminó
  if (torneo.estadoTorneo === "COMPLETED") {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5>🏆 Torneo Finalizado</h5>
          <p className="text-muted">Los puntajes ya no se pueden modificar</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario seleccionado
  if (!usuarioSel) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5>👈 Selecciona un participante</h5>
          <p className="text-muted">
            Elige un arquero de la lista para registrar puntajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-warning">
        <h5 className="mb-0">Gestión de Flechas</h5>
      </div>
      <div className="card-body">
        <form onSubmit={onGuardarPuntaje}>
          <div className="mb-3">
            <label className="form-label fw-bold">Seleccionar Ronda</label>
            <select
              className="form-select"
              value={rondaSel}
              onChange={(e) => setRondaSel(e.target.value)}
              required
            >
              <option value="">-- Elige una ronda --</option>
              {rondas.map((r) => (
                <option key={r.idRonda} value={r.numeroRonda}>
                  Ronda N° {r.numeroRonda}
                </option>
              ))}
            </select>
          </div>

          {rondaSel && (
            <div className="bg-light p-3 rounded">
              <label className="form-label fw-bold">Puntajes (0-10)</label>
              <div className="d-flex gap-3 mb-3">
                {flechas.map((val, idx) => (
                  <div key={idx} className="text-center">
                    <input
                      type="number"
                      className="form-control text-center fw-bold"
                      style={{ width: "80px", fontSize: "1.5rem" }}
                      value={val}
                      min="0"
                      max="10"
                      required
                      onChange={(e) => {
                        const nuevas = [...flechas];
                        nuevas[idx] = e.target.value;
                        setFlechas(nuevas);
                      }}
                    />
                    <small>Flecha {idx + 1}</small>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="btn btn-dark w-100"
                disabled={guardandoPuntaje}
              >
                {guardandoPuntaje ? "Guardando..." : "💾 Guardar Puntajes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
