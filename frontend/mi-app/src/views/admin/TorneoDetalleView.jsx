import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import torneoService from "../../api/apiTorneos.js";
import apiParticipaciones from "../../api/apiParticipaciones.js";
import categoriaService from "../../api/apiCategorias.js";
import apiMapas from "../../api/apiMapas.js";
import api from "../../api/api.js";
import TorneoCabecera from "../../components/admin/TorneoCabecera.jsx";
import ListaParticipantes from "../../components/admin/ListaParticipantes.jsx";
import FormularioFlechas from "../../components/admin/FormularioFlechas.jsx";
import Podio from "../../components/admin/Podio.jsx";
import Basemap from "../../components/maps/Basemap.jsx";
import PolygonsLayer from "../../components/maps/PolygonsLayer.jsx";
import FitBoundsFromPolygonLayer from "../../components/maps/FitBoundsFromPolygonLayer.jsx";
import LinesLayer from "../../components/maps/LinesLayer.jsx";
import ArcherDianaSelectorLayer from "../../components/maps/ArcherDianaSelectorLayer.jsx";
import {
  normalizeRoundPoint,
  pointToGeoJSONString,
} from "../../utils/posicionesRonda.js";
import { backendResponseToFeatureCollection } from "../../components/maps/geojson.js";

const AMBIENTAL_FILL_PAINT = {
  "fill-color": [
    "match",
    ["get", "tipo"],
    "Viento Fuerte",
    "#f97316",
    "Lluvia Ligera",
    "#0ea5e9",
    "Calma Total",
    "#22c55e",
    "#8b5cf6",
  ],
  "fill-opacity": 0.42,
};

const AMBIENTAL_LINE_PAINT = {
  "line-color": [
    "match",
    ["get", "tipo"],
    "Viento Fuerte",
    "#c2410c",
    "Lluvia Ligera",
    "#0369a1",
    "Calma Total",
    "#15803d",
    "#6d28d9",
  ],
  "line-width": 3,
  "line-opacity": 0.95,
  "line-dasharray": [2, 1],
};

const AMBIENTAL_LABEL_PAINT = {
  "text-color": "#0f172a",
  "text-halo-color": "#ffffff",
  "text-halo-width": 2,
};

const AMBIENTAL_LABEL_LAYOUT = {
  "text-field": ["coalesce", ["get", "label"], ""],
  "text-size": 13,
  "text-anchor": "center",
  "text-allow-overlap": true,
};

const AMBIENTAL_LEGEND_COLORS = {
  "Viento Fuerte": "#f97316",
  "Lluvia Ligera": "#0ea5e9",
  "Calma Total": "#22c55e",
};

function requestErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  return data?.message ?? data?.detail ?? data?.error ?? fallback;
}

function normalizeArrowScores(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsedValue = JSON.parse(value);
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  }

  return [];
}

export default function TorneoDetalleView() {
  const { idTorneo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [torneo, setTorneo] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [rondas, setRondas] = useState([]);
  const [podio, setPodio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorPuntaje, setErrorPuntaje] = useState("");
  const [mostrarMapa, setMostrarMapa] = useState(true);

  const [usuarioSel, setUsuarioSel] = useState("");
  const [rondaSel, setRondaSel] = useState("");
  const [flechas, setFlechas] = useState(["", "", "", "", "", ""]);
  const [guardandoPuntaje, setGuardandoPuntaje] = useState(false);
  const [distanciaTiroM, setDistanciaTiroM] = useState(null);
  const [posicionArquero, setPosicionArquero] = useState(null);
  const [posicionDiana, setPosicionDiana] = useState(null);
  const [posicionesRonda, setPosicionesRonda] = useState([]);
  const [posicionesVersion, setPosicionesVersion] = useState(0);
  const [mapMessage, setMapMessage] = useState("");
  const [registroRondaExistente, setRegistroRondaExistente] = useState(false);
  const [zonasAmbientales, setZonasAmbientales] = useState([]);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const torneoActual = await torneoService.obtenerTorneo(idTorneo);

      if (!torneoActual) {
        navigate("/admin/torneos");
        return;
      }

      setTorneo(torneoActual);

      const [datosCompletos, rondasData, podioData, zonasAmbientalesData] =
        await Promise.all([
          apiParticipaciones
            .obtenerDatosCompletosTorneo(idTorneo)
            .catch(() => null),
          api
            .get(`/rondas/torneo/${idTorneo}`)
            .then((r) => r.data)
            .catch(() => []),
          torneoActual.estadoTorneo === "COMPLETED"
            ? torneoService.obtenerPodio(idTorneo).catch(() => [])
            : Promise.resolve([]),
          apiMapas.obtenerZonasAmbientales().catch(() => []),
        ]);

      setInscritos(datosCompletos?.arqueros || []);
      setRondas(rondasData);
      setPodio(podioData);
      setZonasAmbientales(
        Array.isArray(zonasAmbientalesData) ? zonasAmbientalesData : [],
      );
    } catch (err) {
      setError("Error al cargar los datos del torneo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idTorneo, navigate]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    let ignore = false;

    if (!torneo?.idCategoria) {
      setDistanciaTiroM(null);
      return undefined;
    }

    categoriaService
      .obtenerPorId(torneo.idCategoria)
      .then((categoria) => {
        const distancia = Number(categoria?.distanciaTiro);

        if (!ignore) {
          setDistanciaTiroM(
            Number.isFinite(distancia) && distancia > 0 ? distancia : null,
          );
        }
      })
      .catch(() => {
        if (!ignore) setDistanciaTiroM(null);
      });

    return () => {
      ignore = true;
    };
  }, [torneo?.idCategoria]);

  useEffect(() => {
    let ignore = false;

    if (!rondaSel) return undefined;

    torneoService
      .obtenerPosicionesRonda(idTorneo, rondaSel)
      .then((posiciones) => {
        if (!ignore) {
          setPosicionesRonda(Array.isArray(posiciones) ? posiciones : []);
        }
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, [idTorneo, posicionesVersion, rondaSel, usuarioSel]);

  useEffect(() => {
    let ignore = false;

    if (!usuarioSel || !rondaSel) {
      setFlechas(["", "", "", "", "", ""]);
      setPosicionArquero(null);
      setPosicionDiana(null);
      setRegistroRondaExistente(false);
      return undefined;
    }

    torneoService
      .obtenerPosicionArqueroEnRonda(idTorneo, rondaSel, usuarioSel)
      .then((posicionSeleccionada) => {
        if (ignore) return;

        const flechasRegistradas = normalizeArrowScores(
          posicionSeleccionada?.flechas,
        );

        const existeRegistro = Boolean(
          posicionSeleccionada?.id_participacion ??
            posicionSeleccionada?.idParticipacion ??
            posicionSeleccionada?.posicion_arquero ??
            posicionSeleccionada?.posicionArquero ??
            flechasRegistradas.length,
        );

        setRegistroRondaExistente(existeRegistro);

        if (flechasRegistradas.length) {
          setFlechas(flechasRegistradas.map((flecha) => String(flecha)));
        } else {
          setFlechas(["", "", "", "", "", ""]);
        }

        setPosicionArquero(
          normalizeRoundPoint(posicionSeleccionada?.posicion_arquero),
        );
        setPosicionDiana(
          normalizeRoundPoint(posicionSeleccionada?.posicion_diana),
        );
      })
      .catch(() => {
        if (!ignore) {
          setFlechas(["", "", "", "", "", ""]);
          setPosicionArquero(null);
          setPosicionDiana(null);
          setRegistroRondaExistente(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [idTorneo, posicionesVersion, rondaSel, usuarioSel]);

  const handleSeleccionarUsuario = (idUsuario) => {
    setUsuarioSel(idUsuario);
    setPosicionArquero(null);
    setPosicionDiana(null);
    setRegistroRondaExistente(false);
    setMapMessage("");
    setErrorPuntaje("");
  };

  const handleCambiarRonda = (numeroRonda) => {
    setRondaSel(numeroRonda);
    setPosicionArquero(null);
    setPosicionDiana(null);
    setPosicionesRonda([]);
    setRegistroRondaExistente(false);
    setMapMessage("");
    setErrorPuntaje("");
  };

  const handleCambiarPosiciones = ({ arquero, diana }) => {
    setPosicionArquero(arquero);
    setPosicionDiana(diana);
  };

  const handleReubicarArquero = () => {
    setPosicionArquero(null);
    setPosicionDiana(null);
    setMapMessage("Selecciona nuevamente la posición del arquero sobre la línea de tiro.");
  };

  const handleReubicarDiana = () => {
    setPosicionDiana(null);
    setMapMessage("Elige una nueva dirección para la diana.");
  };

  const zonasAmbientalesGeojson = useMemo(
    () =>
      backendResponseToFeatureCollection(
        zonasAmbientales,
        "tipo",
        ["Polygon", "MultiPolygon"],
        "geomArea",
      ),
    [zonasAmbientales],
  );
  const tiposZonasAmbientales = useMemo(
    () =>
      [
        ...new Set(
          zonasAmbientales
            .map((zona) => zona?.tipo)
            .filter((tipo) => typeof tipo === "string" && tipo.trim()),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [zonasAmbientales],
  );
  const ubicacionesListas = Boolean(posicionArquero && posicionDiana);
  const puedeSeleccionarUbicacion =
    Boolean(usuarioSel && rondaSel) &&
    torneo?.estadoTorneo === "IN_COURSE" &&
    distanciaTiroM !== null;
  const instruccionMapa = !usuarioSel
    ? "Selecciona un participante para ubicarlo en el mapa."
    : !rondaSel
      ? "Selecciona una ronda para registrar sus ubicaciones."
      : distanciaTiroM === null
        ? "La categoría del torneo debe tener una distancia de tiro mayor que cero."
        : !posicionArquero
          ? "Haz clic sobre la línea de tiro para ubicar al arquero."
          : !posicionDiana
            ? `Haz clic para elegir la dirección de la diana a ${distanciaTiroM} m.`
            : "Arquero y diana ubicados.";

  const handleIniciarTorneo = async () => {
    if (window.confirm("¿Iniciar torneo?")) {
      try {
        await torneoService.iniciarTorneo(idTorneo);
        cargarDatos();
      } catch {
        alert("Error al iniciar el torneo");
      }
    }
  };

  const handleFinalizarTorneo = async () => {
    if (window.confirm("¿Finalizar torneo?")) {
      try {
        await torneoService.finalizarTorneo(idTorneo);
        cargarDatos();
      } catch {
        alert("Error al finalizar el torneo");
      }
    }
  };

  const handleGuardarPuntaje = async (e) => {
    e?.preventDefault();
    setErrorPuntaje("");
    const flechasInt = flechas.map((flecha) => Number(flecha));

    if (
      flechas.length !== 6 ||
      flechas.some(
        (flecha, index) =>
          flecha === "" ||
          !Number.isInteger(flechasInt[index]),
      )
    ) {
      setErrorPuntaje(
        "Completa las seis flechas con valores enteros.",
      );
      return;
    }

    if (!ubicacionesListas) {
      setErrorPuntaje(
        "Debes ubicar al arquero y a la diana antes de registrar las flechas.",
      );
      return;
    }

    const ronda = rondas.find((r) => r.numeroRonda === Number(rondaSel));
    if (!ronda) return;

    const idAdmin = Number(user?.idUsuario);
    if (!Number.isInteger(idAdmin) || idAdmin <= 0) {
      setErrorPuntaje(
        "No se encontró el administrador autenticado para registrar las flechas.",
      );
      return;
    }

    const participacion = inscritos.find(
      (inscrito) => String(inscrito.idUsuario) === String(usuarioSel),
    );
    if (!participacion?.idParticipacion) {
      setErrorPuntaje(
        "No se encontró la participación del arquero seleccionado.",
      );
      return;
    }

    setGuardandoPuntaje(true);
    try {
      await torneoService.registrarPuntaje({
        idRonda: ronda.idRonda,
        idParticipacion: participacion.idParticipacion,
        idAdmin,
        flechas: flechasInt,
        posicionArquero: pointToGeoJSONString(posicionArquero),
        posicionDiana: pointToGeoJSONString(posicionDiana),
      });
      setErrorPuntaje("");
      setMapMessage("Puntajes y ubicaciones registrados correctamente.");
      setPosicionesVersion((version) => version + 1);
      void cargarDatos();
    } catch (requestError) {
      setErrorPuntaje(
        requestErrorMessage(
          requestError,
          "No se pudieron registrar los puntajes de la ronda.",
        ),
      );
    } finally {
      setGuardandoPuntaje(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <output className="spinner-border" aria-label="Cargando" />
        <p className="mt-3 text-muted">Cargando detalles del torneo...</p>
      </div>
    );
  }

  if (!torneo) return null;

  return (
    <div className="container-fluid py-3">
      {error && <div className="alert alert-danger">{error}</div>}

      <TorneoCabecera
        torneo={torneo}
        onIniciar={handleIniciarTorneo}
        onFinalizar={handleFinalizarTorneo}
        onVolver={() => navigate("/admin/torneos")}
      />

      <div className="mb-3">
        <button
          className="btn btn-outline-dark"
          onClick={() => setMostrarMapa(!mostrarMapa)}
        >
          {mostrarMapa ? "Ocultar Mapa" : "Mostrar Mapa"}
        </button>
      </div>

      {mostrarMapa && (
        <>
          <div style={{ width: "100%", height: "420px" }}>
            <Basemap>
              <PolygonsLayer data={torneo.geomZonaCompetencia} />
              <PolygonsLayer
                id="zonas-ambientales"
                data={zonasAmbientalesGeojson}
                fillPaint={AMBIENTAL_FILL_PAINT}
                linePaint={AMBIENTAL_LINE_PAINT}
                labelPaint={AMBIENTAL_LABEL_PAINT}
                labelLayout={AMBIENTAL_LABEL_LAYOUT}
              />
              <LinesLayer data={torneo.lineaTiro} />
              <ArcherDianaSelectorLayer
                enabled={puedeSeleccionarUbicacion}
                zone={torneo.geomZonaCompetencia}
                shootingLine={torneo.lineaTiro}
                distanceM={distanciaTiroM}
                value={{ arquero: posicionArquero, diana: posicionDiana }}
                registeredPositions={posicionesRonda}
                onChange={handleCambiarPosiciones}
                onMessage={setMapMessage}
              />
              <FitBoundsFromPolygonLayer polygon={torneo.geomZonaCompetencia} />
            </Basemap>
          </div>
          <div className={`alert mt-2 mb-3 ${mapMessage ? "alert-info" : "alert-secondary"}`}>
            {mapMessage || instruccionMapa}
            {tiposZonasAmbientales.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {tiposZonasAmbientales.map((tipo) => (
                  <span
                    key={tipo}
                    className="badge text-dark border"
                    style={{
                      backgroundColor:
                        AMBIENTAL_LEGEND_COLORS[tipo] ?? "#ddd6fe",
                    }}
                  >
                    {tipo}
                  </span>
                ))}
              </div>
            )}
            {posicionArquero && (
              <button
                type="button"
                className="btn btn-sm btn-outline-dark ms-3"
                onClick={handleReubicarArquero}
              >
                Reubicar arquero
              </button>
            )}
            {posicionArquero && posicionDiana && (
              <button
                type="button"
                className="btn btn-sm btn-outline-dark ms-2"
                onClick={handleReubicarDiana}
              >
                Reubicar diana
              </button>
            )}
          </div>
        </>
      )}

      <div className="row">
        <div className="col-md-5">
          <ListaParticipantes
            inscritos={inscritos}
            usuarioSel={usuarioSel}
            estadoTorneo={torneo.estadoTorneo}
            onSeleccionarUsuario={handleSeleccionarUsuario}
          />
        </div>
        <div className="col-md-7">
          <FormularioFlechas
            torneo={torneo}
            usuarioSel={usuarioSel}
            rondas={rondas}
            rondaSel={rondaSel}
            setRondaSel={handleCambiarRonda}
            flechas={flechas}
            setFlechas={setFlechas}
            ubicacionesListas={ubicacionesListas}
            registroRondaExistente={registroRondaExistente}
            guardandoPuntaje={guardandoPuntaje}
            errorPuntaje={errorPuntaje}
            onGuardarPuntaje={handleGuardarPuntaje}
          />
        </div>
      </div>

      {torneo.estadoTorneo === "COMPLETED" && podio.length > 0 && (
        <Podio podio={podio} />
      )}
    </div>
  );
}
