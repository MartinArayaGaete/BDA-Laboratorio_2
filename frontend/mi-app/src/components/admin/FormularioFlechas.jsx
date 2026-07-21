import React, { useState, useEffect } from "react";
import torneoService from "../../api/apiTorneos.js";
import rondaService from "../../api/apiRondas.js";

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
  const [climas, setClimas] = useState([]);
  const [climaSel, setClimaSel] = useState("");
  const [zonaAsignada, setZonaAsignada] = useState(false);

  useEffect(() => {
    if (torneo?.idTorneo) {
      torneoService
        .obtenerClimasPorTorneo(torneo.idTorneo)
        .then(setClimas)
        .catch(() => setClimas([]));
    }
  }, [torneo]);

  const handleAsignarClima = async () => {
    if (!climaSel || !rondaSel) return;
    const ronda = rondas.find((r) => r.numeroRonda === parseInt(rondaSel));
    if (!ronda) return;

    try {
      await rondaService.asignarZonaAmbiental(
        ronda.idRonda,
        parseInt(climaSel),
      );
      setZonaAsignada(true);
    } catch (err) {
      alert("Error al asignar zona climática");
    }
  };

  if (torneo.estadoTorneo === "NOT_STARTED") {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5>Torneo en Espera</h5>
          <p className="text-muted">Inicia el torneo para gestionar puntajes</p>
        </div>
      </div>
    );
  }

  if (torneo.estadoTorneo === "COMPLETED") {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5>Torneo Finalizado</h5>
          <p className="text-muted">Los puntajes ya no se pueden modificar</p>
        </div>
      </div>
    );
  }

  if (!usuarioSel) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5>Selecciona un participante</h5>
          <p className="text-muted">
            Elige un arquero de la lista para registrar puntajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">Gestión de Ronda</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label fw-bold">Seleccionar Ronda</label>
          <select
            className="form-select"
            value={rondaSel}
            onChange={(e) => {
              setRondaSel(e.target.value);
              setZonaAsignada(false);
              setClimaSel("");
            }}
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

        {rondaSel && climas.length > 0 && (
          <div className="bg-light p-3 rounded mb-3">
            <label className="form-label fw-bold">Condición Climática</label>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={climaSel}
                onChange={(e) => setClimaSel(e.target.value)}
                disabled={zonaAsignada}
              >
                <option value="">-- Seleccionar clima --</option>
                {climas.map((c, idx) => (
                  <option key={idx} value={idx + 1}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-dark"
                onClick={handleAsignarClima}
                disabled={!climaSel || zonaAsignada}
              >
                {zonaAsignada ? "✓ Asignado" : "Asignar"}
              </button>
            </div>
          </div>
        )}

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
              onClick={onGuardarPuntaje}
            >
              {guardandoPuntaje ? "Guardando..." : "Guardar Puntajes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
