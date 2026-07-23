import { useState, useEffect } from "react";
import torneoService from "../../api/apiTorneos.js";
import rondaService from "../../api/apiRondas.js";

const CLIMA_NORMAL_VALUE = "__normal__";

export default function FormularioFlechas({
  torneo,
  usuarioSel,
  rondas,
  rondaSel,
  setRondaSel,
  flechas,
  setFlechas,
  ubicacionesListas,
  registroRondaExistente,
  guardandoPuntaje,
  errorPuntaje,
  onGuardarPuntaje,
}) {
  const [climas, setClimas] = useState([]);
  const [climaSel, setClimaSel] = useState("");
  const [zonaAsignada, setZonaAsignada] = useState(false);
  const flechasCompletas =
    flechas.length === 6 &&
    flechas.every((flecha) => {
      const puntaje = Number(flecha);
      return flecha !== "" && Number.isInteger(puntaje);
    });

  useEffect(() => {
    if (!rondaSel) {
      setClimaSel("");
      setZonaAsignada(false);
      return;
    }

    const ronda = rondas.find((r) => r.numeroRonda === Number(rondaSel));
    if (!ronda) return;

    if (ronda.idZonaAmbiental !== null && ronda.idZonaAmbiental !== undefined) {
      setClimaSel(String(ronda.idZonaAmbiental));
      setZonaAsignada(true);
      return;
    }

    if (registroRondaExistente) {
      setClimaSel(CLIMA_NORMAL_VALUE);
      setZonaAsignada(true);
      return;
    }

    setClimaSel("");
    setZonaAsignada(false);
  }, [registroRondaExistente, rondaSel, rondas]);

  useEffect(() => {
    if (torneo?.idTorneo) {
      torneoService
        .obtenerClimasPorTorneo(torneo.idTorneo)
        .then((climasTorneo) => {
          const sectores = Array.isArray(climasTorneo)
            ? climasTorneo
                .map((clima) => ({
                  id: clima?.id_zona_ambiental ?? clima?.idZonaAmbiental,
                  nombre:
                    clima?.categoria_ambiental ?? clima?.categoriaAmbiental,
                }))
                .filter((clima) => clima.id != null && clima.nombre)
            : [];

          setClimas([{ id: null, nombre: "Normal" }, ...sectores]);
        })
        .catch(() => setClimas([{ id: null, nombre: "Normal" }]));
    }
  }, [torneo]);

  const handleAsignarClima = async () => {
    if (!climaSel || !rondaSel) return;
    const ronda = rondas.find((r) => r.numeroRonda === parseInt(rondaSel));
    if (!ronda) return;

    try {
      const idZonaAmbiental =
        climaSel === CLIMA_NORMAL_VALUE ? null : parseInt(climaSel, 10);

      await rondaService.asignarZonaAmbiental(
        ronda.idRonda,
        idZonaAmbiental,
      );
      setZonaAsignada(true);
    } catch {
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

        {rondaSel && (
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
                {climas.map((c) => (
                  <option
                    key={c.id ?? "normal"}
                    value={c.id === null ? CLIMA_NORMAL_VALUE : c.id}
                  >
                    {c.nombre}
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

        {rondaSel && zonaAsignada && (
          <div className="bg-light p-3 rounded">
            {!ubicacionesListas && (
              <div className="alert alert-warning py-2">
                Debes ubicar al arquero y la diana en el mapa antes de registrar.
              </div>
            )}
            <label className="form-label fw-bold">Puntajes</label>
            <div className="d-flex gap-3 mb-3">
              {flechas.map((val, idx) => (
                <div key={idx} className="text-center">
                  <input
                    type="number"
                    className="form-control text-center fw-bold"
                    style={{ width: "80px", fontSize: "1.5rem" }}
                    value={val}
                    step="1"
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
              disabled={
                guardandoPuntaje || !ubicacionesListas || !flechasCompletas
              }
              onClick={onGuardarPuntaje}
            >
              {guardandoPuntaje ? "Guardando..." : "Guardar Puntajes"}
            </button>
            {errorPuntaje && (
              <div className="alert alert-danger mt-3 mb-0">
                {errorPuntaje}
              </div>
            )}
          </div>
        )}
        {rondaSel && !zonaAsignada && (
          <div className="alert alert-warning mt-3">
            Debes asignar una zona climática para registrar puntajes.
          </div>
        )}
      </div>
    </div>
  );
}
