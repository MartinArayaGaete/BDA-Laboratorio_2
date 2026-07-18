// src/views/archer/TorneosView.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import torneoService from "../../api/apiTorneos.js";
import apiParticipaciones from "../../api/apiParticipaciones.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function TorneosView() {
  const { user } = useAuth();
  const [torneos, setTorneos] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("disponibles");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inscribiendo, setInscribiendo] = useState(null);

  // Modal de inscripción con coordenadas
  const [showModal, setShowModal] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [coordsArquero, setCoordsArquero] = useState({
    lat: "-33.448",
    lng: "-70.634",
  });
  const [coordsBlanco, setCoordsBlanco] = useState({
    lat: "-33.4485",
    lng: "-70.634",
  });

  const cargarTorneos = useCallback(async () => {
    if (!user?.idUsuario) return;
    try {
      setLoading(true);
      setError("");
      const [todosTorneos, torneosInscritos] = await Promise.all([
        torneoService.obtenerTodos().catch(() => []),
        apiParticipaciones
          .obtenerTorneosInscritos(user.idUsuario)
          .catch(() => []),
      ]);
      const torneosArray = Array.isArray(todosTorneos) ? todosTorneos : [];
      const inscritosArray = Array.isArray(torneosInscritos)
        ? torneosInscritos
        : [];
      const disponibles = torneosArray.filter(
        (t) =>
          t.estadoTorneo === "NOT_STARTED" &&
          !inscritosArray.some((i) => i.id_torneo === t.idTorneo),
      );
      setTorneos(disponibles);
      setInscritos(inscritosArray);
    } catch (err) {
      setError("Error al cargar torneos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarTorneos();
  }, [cargarTorneos]);

  const abrirModalInscripcion = (torneo) => {
    setTorneoSeleccionado(torneo);
    setCoordsArquero({ lat: "-33.448", lng: "-70.634" });
    setCoordsBlanco({ lat: "-33.4485", lng: "-70.634" });
    setShowModal(true);
  };

  const handleInscribir = async () => {
    if (!torneoSeleccionado) return;
    setError("");
    setSuccess("");
    setInscribiendo(torneoSeleccionado.idTorneo);

    try {
      await apiParticipaciones.inscribirArquero(
        torneoSeleccionado.idTorneo,
        user.idUsuario,
        JSON.stringify({
          type: "Point",
          coordinates: [
            parseFloat(coordsArquero.lng),
            parseFloat(coordsArquero.lat),
          ],
        }),
        JSON.stringify({
          type: "Point",
          coordinates: [
            parseFloat(coordsBlanco.lng),
            parseFloat(coordsBlanco.lat),
          ],
        }),
      );
      setSuccess("¡Inscripción exitosa!");
      setShowModal(false);
      cargarTorneos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err.response?.data || "Error al inscribirse";
      setError(typeof msg === "string" ? msg : "Error al inscribirse");
    } finally {
      setInscribiendo(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      NOT_STARTED: { class: "bg-secondary", text: "Próximo" },
      IN_COURSE: { class: "bg-primary", text: "En Curso" },
      COMPLETED: { class: "bg-success", text: "Finalizado" },
    };
    const config = estados[estado] || { class: "bg-dark", text: estado };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) return <LoadingSpinner message="Cargando torneos..." />;

  return (
    <div>
      <h2 className="mb-4 text-dark">Mis Torneos</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "disponibles" ? "active" : ""}`}
            onClick={() => setActiveTab("disponibles")}
          >
            Disponibles ({torneos.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "inscritos" ? "active" : ""}`}
            onClick={() => setActiveTab("inscritos")}
          >
            Inscritos ({inscritos.length})
          </button>
        </li>
      </ul>

      {/* Torneos Disponibles */}
      {activeTab === "disponibles" &&
        (torneos.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No hay torneos disponibles para inscripción</p>
          </div>
        ) : (
          <div className="row">
            {torneos.map((torneo) => (
              <div key={torneo.idTorneo} className="col-md-6 mb-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">{torneo.nombreTorneo}</h5>
                    <p className="text-muted small">
                      {torneo.fechaInicio} → {torneo.fechaTermino}
                    </p>
                    {getEstadoBadge(torneo.estadoTorneo)}
                    <button
                      className="btn btn-dark btn-sm mt-2 w-100"
                      onClick={() => abrirModalInscripcion(torneo)}
                    >
                      Inscribirme
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Torneos Inscritos */}
      {activeTab === "inscritos" &&
        (inscritos.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No estás inscrito en ningún torneo</p>
          </div>
        ) : (
          <div className="row">
            {inscritos.map((torneo) => (
              <div
                key={torneo.id_torneo || torneo.idTorneo}
                className="col-md-6 mb-3"
              >
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      {torneo.nombre_torneo || torneo.nombreTorneo}
                    </h5>
                    <p className="text-muted small">
                      {torneo.fecha_inicio || torneo.fechaInicio} →{" "}
                      {torneo.fecha_termino || torneo.fechaTermino}
                    </p>
                    {getEstadoBadge(
                      torneo.estado_torneo || torneo.estadoTorneo,
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Modal de Inscripción con Coordenadas */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  📍 Inscribirse en: {torneoSeleccionado?.nombreTorneo}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info small mb-3">
                  <strong>ℹ️ </strong>
                  Debes estar dentro de la zona de competencia y a menos de 5
                  metros de la línea de tiro. Usa el preset de Santiago o
                  ingresa tus coordenadas manualmente.
                </div>

                <h6>🎯 Tu Ubicación (Arquero)</h6>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small">Latitud</label>
                    <input
                      type="text"
                      className="form-control"
                      value={coordsArquero.lat}
                      onChange={(e) =>
                        setCoordsArquero({
                          ...coordsArquero,
                          lat: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">Longitud</label>
                    <input
                      type="text"
                      className="form-control"
                      value={coordsArquero.lng}
                      onChange={(e) =>
                        setCoordsArquero({
                          ...coordsArquero,
                          lng: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <h6>🏹 Ubicación del Blanco</h6>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small">Latitud</label>
                    <input
                      type="text"
                      className="form-control"
                      value={coordsBlanco.lat}
                      onChange={(e) =>
                        setCoordsBlanco({
                          ...coordsBlanco,
                          lat: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">Longitud</label>
                    <input
                      type="text"
                      className="form-control"
                      value={coordsBlanco.lng}
                      onChange={(e) =>
                        setCoordsBlanco({
                          ...coordsBlanco,
                          lng: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100 mb-2"
                  onClick={() => {
                    setCoordsArquero({ lat: "-33.448", lng: "-70.634" });
                    setCoordsBlanco({ lat: "-33.4485", lng: "-70.634" });
                  }}
                >
                  📍 Usar preset Santiago
                </button>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={handleInscribir}
                  disabled={inscribiendo === torneoSeleccionado?.idTorneo}
                >
                  {inscribiendo === torneoSeleccionado?.idTorneo
                    ? "Inscribiendo..."
                    : "✅ Confirmar Inscripción"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
