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

  const handleInscribir = async (torneo) => {
    setError("");
    setSuccess("");
    setInscribiendo(torneo.idTorneo);

    try {
      await apiParticipaciones.inscribirArquero(
        torneo.idTorneo,
        user.idUsuario,
      );
      setSuccess("¡Inscripción exitosa!");
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
                    <h5 className="card-title text-dark">
                      {torneo.nombreTorneo}
                    </h5>
                    <p className="text-muted small">
                      {torneo.fechaInicio} → {torneo.fechaTermino}
                    </p>
                    <p className="text-muted small">
                      Plazas: {torneo.nroPlazaActual ?? 0}/
                      {torneo.nroPlazaMax ?? "?"}
                    </p>
                    {getEstadoBadge(torneo.estadoTorneo)}
                    <button
                      className="btn btn-dark btn-sm mt-2 w-100"
                      onClick={() => handleInscribir(torneo)}
                      disabled={
                        inscribiendo === torneo.idTorneo ||
                        torneo.nroPlazaActual >= torneo.nroPlazaMax
                      }
                    >
                      {inscribiendo === torneo.idTorneo
                        ? "Inscribiendo..."
                        : torneo.nroPlazaActual >= torneo.nroPlazaMax
                          ? "Sin plazas"
                          : "Inscribirme"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

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
                    <h5 className="card-title text-dark">
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
    </div>
  );
}
