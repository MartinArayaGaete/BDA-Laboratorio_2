import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import apiParticipaciones from "../../api/apiParticipaciones";

function ArcherDashboard() {
  const PAGE_SIZE = 6;
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [usuarioCargado, setUsuarioCargado] = useState(false);
  const [torneos, setTorneos] = useState([]);
  const [torneosCargando, setTorneosCargando] = useState(true);
  const [torneosPage, setTorneosPage] = useState(0);
  const [torneosTotalPages, setTorneosTotalPages] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [historialCargando, setHistorialCargando] = useState(true);
  const [historialPage, setHistorialPage] = useState(0);
  const [historialTotalPages, setHistorialTotalPages] = useState(0);
  const [flechasPorTorneo, setFlechasPorTorneo] = useState({});
  const [estadisticas, setEstadisticas] = useState({
    torneosTotales: 0,
    totalFlechas: 0,
    flechasAcertadas: 0,
    porcentajeAcierto: 0,
    totalPuntos: 0,
    promedioPuntos: 0,
  });
  const [estadisticasCargando, setEstadisticasCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [inscribiendoTorneo, setInscribiendoTorneo] = useState(null);
  const [errorInscripcion, setErrorInscripcion] = useState("");
  const [desinscribiendoTorneo, setDesinscribiendoTorneo] = useState(null);
  const [errorDesinscripcion, setErrorDesinscripcion] = useState("");

  const esErrorAuth = (err) => {
    const status = err?.response?.status;
    return status === 401 || status === 403;
  };

  const cargarTorneos = async (pagina = torneosPage) => {
    try {
      setTorneosCargando(true);
      setErrorCarga("");
      const resp = await api.get("/torneos/disponibles", {
        params: {
          idUsuario: usuario.idUsuario,
          page: pagina,
          size: PAGE_SIZE,
        },
      });

      const payload = resp.data || {};
      const disponibles = Array.isArray(payload.content)
        ? payload.content
        : Array.isArray(payload.torneos)
          ? payload.torneos
          : [];
      const totalPages = Number(payload.totalPages || 0);

      setTorneos(disponibles);
      setTorneosTotalPages(totalPages);
    } catch (err) {
      if (esErrorAuth(err)) {
        localStorage.removeItem("usuarioLogueado");
        navigate("/login");
        return;
      }
      console.error("Error traer torneos:", err);
      setErrorCarga("No se pudieron cargar los torneos.");
      setTorneos([]);
      setTorneosTotalPages(0);
    } finally {
      setTorneosCargando(false);
    }
  };

  const cargarHistorial = async (pagina = historialPage) => {
    try {
      setHistorialCargando(true);
      setErrorCarga("");
      const resp = await api.get(`/arqueros/${usuario.idUsuario}/historial`, {
        params: { page: pagina, size: PAGE_SIZE },
      });

      const payload = resp.data || {};
      const torneosPagina = Array.isArray(payload.torneos)
        ? payload.torneos
        : [];
      const totalPages = Number(payload.totalPages || 0);

      const torneosVisible = Array.isArray(torneosPagina) ? torneosPagina : [];
      const flechasPorTorneoLocal = {};

      torneosVisible.forEach((torneo) => {
        const rondas = Array.isArray(torneo.rondas) ? torneo.rondas : [];
        const flechasDelTorneo = [];
        rondas.forEach((ronda) => {
          const numeroRonda = ronda?.numeroRonda;
          const flechasRonda = Array.isArray(ronda?.flechas)
            ? ronda.flechas
            : [];
          flechasRonda.forEach((flecha) => {
            flechasDelTorneo.push({ ...flecha, numeroRonda });
          });
        });
        flechasPorTorneoLocal[torneo.idTorneo] = flechasDelTorneo;
      });

      setHistorial(torneosVisible);
      setHistorialTotalPages(totalPages);
      setFlechasPorTorneo(flechasPorTorneoLocal);
    } catch (err) {
      if (esErrorAuth(err)) {
        localStorage.removeItem("usuarioLogueado");
        navigate("/login");
        return;
      }
      console.error("Error traer historial:", err);
      setErrorCarga("No se pudo cargar el historial.");
      setHistorial([]);
      setHistorialTotalPages(0);
      setFlechasPorTorneo({});
    } finally {
      setHistorialCargando(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setEstadisticasCargando(true);
      const resp = await api.get(`/arqueros/${usuario.idUsuario}/estadisticas`);
      setEstadisticas(resp.data || {});
    } catch (err) {
      if (esErrorAuth(err)) {
        localStorage.removeItem("usuarioLogueado");
        navigate("/login");
        return;
      }
      console.error("Error traer estadisticas:", err);
      setEstadisticas({
        torneosTotales: 0,
        totalFlechas: 0,
        flechasAcertadas: 0,
        porcentajeAcierto: 0,
        totalPuntos: 0,
        promedioPuntos: 0,
      });
    } finally {
      setEstadisticasCargando(false);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (err) {
        localStorage.removeItem("usuarioLogueado");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
    setUsuarioCargado(true);
  }, [navigate]);

  useEffect(() => {
    if (!usuario) return;
    cargarTorneos();
  }, [usuario, torneosPage]);

  useEffect(() => {
    if (!usuario) return;
    cargarHistorial();
  }, [usuario, historialPage]);

  useEffect(() => {
    if (!usuario) return;
    cargarEstadisticas();
  }, [usuario]);

  const handleInscribirse = async (torneo) => {
    if (!usuario) return;

    if (torneo.estadoTorneo !== "NOT_STARTED") {
      setErrorInscripcion(
        "El torneo debe estar en estado NOT_STARTED para inscribirse.",
      );
      setTimeout(() => setErrorInscripcion(""), 3000);
      return;
    }

    setInscribiendoTorneo(torneo.idTorneo);
    setErrorInscripcion("");

    try {
      await apiParticipaciones.inscribirArquero(
        torneo.idTorneo,
        usuario.idUsuario,
      );
      await Promise.all([
        cargarTorneos(torneosPage),
        cargarHistorial(historialPage),
        cargarEstadisticas(),
      ]);
      setInscribiendoTorneo(null);
    } catch (err) {
      const mensajeError =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Error al inscribirse.";
      setErrorInscripcion(String(mensajeError));
      setTimeout(() => setErrorInscripcion(""), 4000);
      setInscribiendoTorneo(null);
    }
  };

  const handleDesinscribirse = async (torneo) => {
    if (!usuario) return;

    if (torneo.estadoTorneo !== "NOT_STARTED") {
      setErrorDesinscripcion(
        "No puedes desinscribirte de un torneo que ya inició.",
      );
      setTimeout(() => setErrorDesinscripcion(""), 3000);
      return;
    }

    const flechasDelTorneo = flechasPorTorneo[torneo.idTorneo] || [];
    if (flechasDelTorneo.length > 0) {
      setErrorDesinscripcion(
        "No puedes desinscribirte: ya tienes flechas registradas.",
      );
      setTimeout(() => setErrorDesinscripcion(""), 3000);
      return;
    }

    if (!window.confirm(`¿Desinscribirte de "${torneo.nombreTorneo}"?`)) return;

    setDesinscribiendoTorneo(torneo.idTorneo);
    setErrorDesinscripcion("");

    try {
      await apiParticipaciones.desinscribirArquero(
        torneo.idTorneo,
        usuario.idUsuario,
      );
      await Promise.all([
        cargarTorneos(torneosPage),
        cargarHistorial(historialPage),
        cargarEstadisticas(),
      ]);
      setDesinscribiendoTorneo(null);
    } catch (err) {
      const mensajeError =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Error al desinscribirse.";
      setErrorDesinscripcion(String(mensajeError));
      setTimeout(() => setErrorDesinscripcion(""), 4000);
      setDesinscribiendoTorneo(null);
    }
  };

  const torneosArray = Array.isArray(torneos) ? torneos : [];
  const historialArray = Array.isArray(historial) ? historial : [];
  const puntosMaximos = Math.max(
    ...historialArray.map((item) => item.puntajeFinal || 0),
    1,
  );
  const stats = estadisticas || {};

  const torneosPaginados = torneosArray;
  const historialPaginado = historialArray;

  const renderPieGrafico = () => {
    const acertadas = stats.flechasAcertadas;
    const fallidas = Math.max(stats.totalFlechas - stats.flechasAcertadas, 0);
    const total = acertadas + fallidas;

    if (total === 0) {
      return (
        <div
          className="d-flex align-items-center justify-content-center bg-light rounded-circle border mx-auto"
          style={{ width: 180, height: 180 }}
        >
          <span className="text-dark">Sin datos</span>
        </div>
      );
    }

    const aciertoPorcentaje = (acertadas / total) * 100;
    return (
      <div
        className="position-relative mx-auto"
        style={{ width: 180, height: 180 }}
      >
        <div
          className="rounded-circle w-100 h-100"
          style={{
            background: `conic-gradient(#333 0 ${aciertoPorcentaje}%, #999 ${aciertoPorcentaje}% 100%)`,
          }}
        />
        <div
          className="position-absolute top-50 start-50 translate-middle text-center bg-white rounded-circle d-flex flex-column justify-content-center align-items-center border border-dark"
          style={{ width: 110, height: 110 }}
        >
          <strong className="fs-4 text-dark">{stats.porcentajeAcierto}%</strong>
          <small className="text-dark">acierto</small>
        </div>
      </div>
    );
  };

  if (!usuarioCargado) {
    return (
      <div className="container-fluid py-4 px-4">
        <div className="alert alert-dark">Cargando usuario...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      <h1 className="text-dark">Mi Perfil de Arquero</h1>
      {usuario && (
        <p className="text-dark">
          {usuario.nombre} (ID: {usuario.idUsuario})
        </p>
      )}
      {errorCarga && <div className="alert alert-danger">{errorCarga}</div>}

      <section className="mb-5">
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card text-white bg-dark p-3 text-center">
              <h6>Torneos</h6>
              <h2>{stats.torneosTotales}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-dark p-3 text-center">
              <h6>Total Flechas</h6>
              <h2>{stats.totalFlechas}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-dark p-3 text-center">
              <h6>% Acierto</h6>
              <h2>{stats.porcentajeAcierto}%</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-dark p-3 text-center">
              <h6>Promedio Puntos</h6>
              <h2>{stats.promedioPuntos}</h2>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-5">
            <div className="card p-3 h-100 bg-white">
              <h6 className="mb-3 text-dark">Aciertos vs Fallos</h6>
              {renderPieGrafico()}
              <div className="d-flex justify-content-center gap-3 mt-3 small">
                <span className="text-dark">
                  <span
                    className="badge me-1"
                    style={{ backgroundColor: "#333" }}
                  >
                    &nbsp;
                  </span>
                  Acertadas: {stats.flechasAcertadas}
                </span>
                <span className="text-dark">
                  <span
                    className="badge me-1"
                    style={{ backgroundColor: "#999" }}
                  >
                    &nbsp;
                  </span>
                  Fallidas:{" "}
                  {Math.max(stats.totalFlechas - stats.flechasAcertadas, 0)}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-7">
            <div className="card p-3 h-100 bg-white">
              <h6 className="mb-3 text-dark">Puntos por Torneo</h6>
              {historialArray.length === 0 ? (
                <div className="alert alert-dark border mb-0">
                  Sin torneos en el historial.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {historialArray.map((item) => {
                    const valor = item.puntajeFinal || 0;
                    const width = `${Math.max((valor / puntosMaximos) * 100, 6)}%`;
                    return (
                      <div key={item.idTorneo}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-medium text-dark">
                            {item.nombreTorneo}
                          </span>
                          <span className="text-dark">{valor} pts</span>
                        </div>
                        <div className="progress" style={{ height: 14 }}>
                          <div
                            className="progress-bar bg-dark"
                            role="progressbar"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h5 className="mb-3 text-dark">Mi Historial</h5>
        {errorDesinscripcion && (
          <div className="alert alert-danger alert-dismissible fade show">
            {errorDesinscripcion}
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorDesinscripcion("")}
            ></button>
          </div>
        )}
        {historialCargando ? (
          <div className="alert alert-dark">Cargando...</div>
        ) : historial.length === 0 ? (
          <div className="alert alert-dark">
            No hay torneos registrados aún.
          </div>
        ) : (
          <>
            <div className="row">
              {historialPaginado.map((item) => (
                <div className="col-md-6 mb-3" key={item.idTorneo}>
                  <div className="card p-3 shadow-sm bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 text-dark">{item.nombreTorneo}</h6>
                        <span
                          className={`badge ${item.estadoTorneo === "NOT_STARTED" ? "bg-dark text-white" : item.estadoTorneo === "IN_COURSE" ? "bg-secondary text-white" : "bg-dark text-white"}`}
                        >
                          {item.estadoTorneo}
                        </span>
                      </div>
                      {item.estadoTorneo === "NOT_STARTED" &&
                        (flechasPorTorneo[item.idTorneo] || []).length ===
                          0 && (
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => handleDesinscribirse(item)}
                            disabled={desinscribiendoTorneo === item.idTorneo}
                          >
                            {desinscribiendoTorneo === item.idTorneo
                              ? "..."
                              : "✕"}
                          </button>
                        )}
                    </div>
                    <p className="mb-1 text-dark">
                      Puntaje: <strong>{item.puntajeFinal}</strong>
                    </p>
                    <p className="mb-0 text-dark">
                      Posición: <strong>{item.posicionFinal}°</strong>
                    </p>
                    <details className="mt-2">
                      <summary
                        className="small text-dark"
                        style={{ cursor: "pointer" }}
                      >
                        Ver flechas (
                        {(flechasPorTorneo[item.idTorneo] || []).length})
                      </summary>
                      <div className="mt-2 small">
                        {(() => {
                          const flechasFor =
                            flechasPorTorneo[item.idTorneo] || [];
                          if (flechasFor.length === 0)
                            return (
                              <div className="text-dark">
                                Sin flechas registradas
                              </div>
                            );
                          const agrupadas = flechasFor.reduce((acc, f) => {
                            const r = f.numeroRonda || 0;
                            if (!acc[r]) acc[r] = [];
                            acc[r].push(f);
                            return acc;
                          }, {});
                          return Object.keys(agrupadas)
                            .sort((a, b) => Number(a) - Number(b))
                            .map((r) => (
                              <div key={r} className="mb-2">
                                <strong className="text-dark">Ronda {r}</strong>
                                <ul className="mb-0">
                                  {agrupadas[r].map((f) => (
                                    <li key={f.idFlecha} className="text-dark">
                                      Flecha {f.idFlecha}: {f.puntaje}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ));
                        })()}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
            {historialTotalPages > 1 && (
              <div className="mt-2">
                {Array.from({ length: historialTotalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm me-1 ${i === historialPage ? "btn-dark" : "btn-outline-dark"}`}
                    onClick={() => setHistorialPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="mb-5">
        <h5 className="mb-3 text-dark">Torneos Disponibles</h5>
        {errorInscripcion && (
          <div className="alert alert-danger alert-dismissible fade show">
            {errorInscripcion}
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorInscripcion("")}
            ></button>
          </div>
        )}
        {torneosCargando ? (
          <div className="alert alert-dark">Cargando torneos...</div>
        ) : torneosPaginados.length === 0 ? (
          <div className="alert alert-dark">No hay torneos disponibles.</div>
        ) : (
          <>
            <div className="row">
              {torneosPaginados.map((t) => (
                <div className="col-md-6 mb-3" key={t.idTorneo}>
                  <div className="card p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0 text-dark">{t.nombreTorneo}</h6>
                        <small className="text-dark">
                          {t.fechaInicio} — {t.fechaTermino}
                        </small>
                        <div className="mt-1">
                          <span
                            className={`badge ${t.estadoTorneo === "NOT_STARTED" ? "bg-dark text-white" : t.estadoTorneo === "IN_COURSE" ? "bg-secondary text-white" : "bg-dark text-white"}`}
                          >
                            {t.estadoTorneo}
                          </span>
                          <small className="ms-2 text-dark">
                            Plazas: {t.nroPlazaActual ?? 0}/
                            {t.nroPlazaMax ?? "?"}
                          </small>
                        </div>
                      </div>
                      {t.estadoTorneo === "NOT_STARTED" && (
                        <button
                          className="btn btn-sm btn-dark"
                          onClick={() => handleInscribirse(t)}
                          disabled={
                            inscribiendoTorneo === t.idTorneo ||
                            t.nroPlazaActual >= t.nroPlazaMax
                          }
                        >
                          {inscribiendoTorneo === t.idTorneo
                            ? "..."
                            : t.nroPlazaActual >= t.nroPlazaMax
                              ? "Sin plazas"
                              : "Inscribirme"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {torneosTotalPages > 1 && (
              <div className="mt-2">
                {Array.from({ length: torneosTotalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm me-1 ${i === torneosPage ? "btn-dark" : "btn-outline-dark"}`}
                    onClick={() => setTorneosPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="mb-5">
        <h5 className="mb-3 text-dark">Mis Flechas</h5>
        <div className="alert alert-dark">
          Total de flechas cargadas: {stats.totalFlechas}
        </div>
      </section>
    </div>
  );
}

export default ArcherDashboard;
