import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";
import apiParticipaciones from "../../api/apiParticipaciones.js";
import api from "../../api/api.js";
import TorneoCabecera from "../../components/admin/TorneoCabecera.jsx";
import ListaParticipantes from "../../components/admin/ListaParticipantes.jsx";
import FormularioFlechas from "../../components/admin/FormularioFlechas.jsx";
import Podio from "../../components/admin/Podio.jsx";
import Basemap from "../../components/maps/Basemap.jsx";
import PolygonsLayer from "../../components/maps/PolygonsLayer.jsx";
import FitBoundsFromPolygonLayer from "../../components/maps/FitBoundsFromPolygonLayer.jsx";


export default function TorneoDetalleView() {
  const { idTorneo } = useParams();
  const navigate = useNavigate();

  const [torneo, setTorneo] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [rondas, setRondas] = useState([]);
  const [podio, setPodio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mostrarMapa, setMostrarMapa] = useState(true);

  const [usuarioSel, setUsuarioSel] = useState("");
  const [rondaSel, setRondaSel] = useState("");
  const [flechas, setFlechas] = useState(["", ""]);
  const [guardandoPuntaje, setGuardandoPuntaje] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const torneoActual = await torneoService.obtenerTorneo(idTorneo);

      if (!torneoActual) {
        navigate("/admin/torneos");
        return;
      }

      setTorneo(torneoActual);

      // Cargar datos del torneo desde los servicios disponibles
      const [datosCompletos, rondasData, podioData] = await Promise.all([
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
      ]);

      // Los arqueros vienen con ubicacionArquero y ubicacionBlanco
      setInscritos(datosCompletos?.arqueros || []);
      setRondas(rondasData);
      setPodio(podioData);
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
    if (!usuarioSel || !rondaSel || torneo?.estadoTorneo !== "IN_COURSE") {
      queueMicrotask(() => setFlechas(["", ""]));
      return;
    }

    void api
      .get(
        `/torneos/${idTorneo}/rondas/${rondaSel}/arqueros/${usuarioSel}/flechas`,
      )
      .then((res) => {
        setFlechas(
          res.data?.length
            ? res.data.map((f) => f.puntaje.toString())
            : ["", ""],
        );
      })
      .catch(() => setFlechas(["", ""]));
  }, [idTorneo, rondaSel, torneo?.estadoTorneo, usuarioSel]);

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
    e.preventDefault();
    const flechasInt = flechas.map((f) => Number.parseInt(f, 10));
    if (flechasInt.some((f) => Number.isNaN(f))) {
      alert("Completa todos los valores (0-10)");
      return;
    }
    setGuardandoPuntaje(true);
    try {
      await torneoService.registrarPuntajes(
        idTorneo,
        usuarioSel,
        rondaSel,
        flechasInt,
      );
      alert("Puntajes guardados correctamente");
    } catch {
      alert("Error al guardar puntajes");
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

      {/* Botón para mostrar/ocultar mapa */}
      <div className="mb-3">
        <button
          className="btn btn-outline-dark"
          onClick={() => setMostrarMapa(!mostrarMapa)}
        >
          {mostrarMapa ? "🗺️ Ocultar Mapa" : "🗺️ Mostrar Mapa"}
        </button>
      </div>

      {/* Mapa del torneo */}
      {mostrarMapa && (
        <div style={{ width: "100%", height: "420px" }}>
          <Basemap>
            <PolygonsLayer
              data={torneo?.geomZonaCompetencia}
            />
            
            <FitBoundsFromPolygonLayer
              polygon={torneo?.geomZonaCompetencia}
            />
            
          </Basemap>
        </div>
      )}

      <div className="row">
        <div className="col-md-5">
          <ListaParticipantes
            inscritos={inscritos}
            usuarioSel={usuarioSel}
            estadoTorneo={torneo.estadoTorneo}
            onSeleccionarUsuario={setUsuarioSel}
          />
        </div>
        <div className="col-md-7">
          <FormularioFlechas
            torneo={torneo}
            usuarioSel={usuarioSel}
            rondas={rondas}
            rondaSel={rondaSel}
            setRondaSel={setRondaSel}
            flechas={flechas}
            setFlechas={setFlechas}
            guardandoPuntaje={guardandoPuntaje}
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
