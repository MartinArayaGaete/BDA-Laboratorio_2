import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";

const ESTADOS = {
  NOT_STARTED: { class: "bg-secondary", text: "No Iniciado" },
  IN_COURSE: { class: "bg-primary", text: "En Curso" },
  COMPLETED: { class: "bg-success", text: "Finalizado" },
};

export default function TablaTorneos({ torneos, onTorneoActualizado }) {
  const navigate = useNavigate();
  const [eliminando, setEliminando] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [torneoEditando, setTorneoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombreTorneo: "",
    fechaInicio: "",
    fechaTermino: "",
    nroPlazaMax: 10,
    geomZonaCompetencia: "",
    lineaTiro: "",
  });

  const abrirEditar = (torneo) => {
    setTorneoEditando(torneo);
    setFormData({
      nombreTorneo: torneo.nombreTorneo,
      fechaInicio: torneo.fechaInicio,
      fechaTermino: torneo.fechaTermino,
      nroPlazaMax: torneo.nroPlazaMax || 10,
      geomZonaCompetencia: torneo.geomZonaCompetencia || "",
      lineaTiro: torneo.lineaTiro || "",
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setTorneoEditando(null);
  };

  const handleGuardar = async () => {
    if (
      !formData.nombreTorneo.trim() ||
      !formData.fechaInicio ||
      !formData.fechaTermino
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    setGuardando(true);
    try {
      await torneoService.actualizarTorneo(torneoEditando.idTorneo, {
        nombreTorneo: formData.nombreTorneo.trim(),
        fechaInicio: formData.fechaInicio,
        fechaTermino: formData.fechaTermino,
        nroPlazaMax: parseInt(formData.nroPlazaMax),
        geomZonaCompetencia: formData.geomZonaCompetencia,
        lineaTiro: formData.lineaTiro,
        idCategoria: torneoEditando.idCategoria,
      });
      cerrarModal();
      if (onTorneoActualizado) onTorneoActualizado();
    } catch (err) {
      alert(err.response?.data?.message || "Error al actualizar el torneo");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (torneo) => {
    if (!window.confirm(`¿Eliminar el torneo "${torneo.nombreTorneo}"?`))
      return;
    setEliminando(torneo.idTorneo);
    try {
      await torneoService.eliminarTorneo(torneo.idTorneo);
      if (onTorneoActualizado) onTorneoActualizado();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar el torneo");
    } finally {
      setEliminando(null);
    }
  };

  if (!torneos || torneos.length === 0) return null;

  return (
    <>
      <div className="row">
        {torneos.map((torneo) => {
          const estado = ESTADOS[torneo.estadoTorneo] || {
            class: "bg-dark",
            text: torneo.estadoTorneo,
          };
          return (
            <div key={torneo.idTorneo} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-dark">
                      {torneo.nombreTorneo}
                    </h5>
                    <span className={`badge ${estado.class}`}>
                      {estado.text}
                    </span>
                  </div>
                  <p className="text-muted small mb-2">
                    {torneo.fechaInicio} → {torneo.fechaTermino}
                  </p>
                  <p className="text-muted small mb-2">
                    Plazas: {torneo.nroPlazaActual ?? 0}/
                    {torneo.nroPlazaMax ?? "?"}
                  </p>
                  <button
                    className="btn btn-outline-dark btn-sm w-100 mb-1"
                    onClick={() =>
                      navigate(`/admin/torneos/${torneo.idTorneo}`)
                    }
                  >
                    Gestionar Torneo
                  </button>
                  {torneo.estadoTorneo === "NOT_STARTED" && (
                    <>
                      <button
                        className="btn btn-outline-dark btn-sm w-100 mb-1"
                        onClick={() => abrirEditar(torneo)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => handleEliminar(torneo)}
                        disabled={eliminando === torneo.idTorneo}
                      >
                        {eliminando === torneo.idTorneo
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Editar Torneo</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={cerrarModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombreTorneo}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreTorneo: e.target.value })
                    }
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaInicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaInicio: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      Fecha Término *
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaTermino}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaTermino: e.target.value,
                        })
                      }
                      min={formData.fechaInicio}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    N° Plazas *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="100"
                    value={formData.nroPlazaMax}
                    onChange={(e) =>
                      setFormData({ ...formData, nroPlazaMax: e.target.value })
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
