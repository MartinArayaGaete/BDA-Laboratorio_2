import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";
import categoriaService from "../../api/apiCategorias.js";
import {
  DEFAULT_COORDS_LINEA_TIRO,
  DEFAULT_COORDS_ZONA_COMPETENCIA,
  coordsLineaToLineString,
  coordsZonaToPolygon,
} from "../../hooks/useTorneoMapSelection.js";

const ZONA_FIELDS = [
  { label: "Punto 1", lat: "lat1", lng: "lng1" },
  { label: "Punto 2", lat: "lat2", lng: "lng2" },
  { label: "Punto 3", lat: "lat3", lng: "lng3" },
  { label: "Punto 4", lat: "lat4", lng: "lng4" },
];

const LINEA_FIELDS = [
  { label: "Inicio", lat: "latInicio", lng: "lngInicio" },
  { label: "Fin", lat: "latFin", lng: "lngFin" },
];

const DEFAULT_ANCHO_MINIMO_MAPA = 25;

function ReadonlyCoordinateGroup({ label, latValue, lngValue }) {
  return (
    <div className="col-md-3">
      <label className="form-label small">{label}</label>
      <input
        type="text"
        className="form-control form-control-sm bg-light"
        placeholder="Lat"
        value={latValue}
        readOnly
      />
      <input
        type="text"
        className="form-control form-control-sm bg-light mt-1"
        placeholder="Lng"
        value={lngValue}
        readOnly
      />
    </div>
  );
}

export default function FormCrearTorneo({
  coordsZonaCompetencia = DEFAULT_COORDS_ZONA_COMPETENCIA,
  coordsLineaTiro = DEFAULT_COORDS_LINEA_TIRO,
  onMapRequirementsChange,
}) {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [formData, setFormData] = useState({
    nombreTorneo: "",
    idCategoria: "",
    fechaInicio: "",
    fechaTermino: "",
    numeroRondas: 1,
    nroPlazaMax: 10,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const zonaGeoJSON = useMemo(() => {
    return coordsZonaToPolygon(coordsZonaCompetencia);
  }, [coordsZonaCompetencia]);

  const lineaGeoJSON = useMemo(() => {
    return coordsLineaToLineString(coordsLineaTiro);
  }, [coordsLineaTiro]);

  const coordenadasCompletas = Boolean(zonaGeoJSON && lineaGeoJSON);
  const categoriaSeleccionada = useMemo(() => {
    return categorias.find(
      (categoria) => String(categoria.idCategoria) === String(formData.idCategoria),
    );
  }, [categorias, formData.idCategoria]);
  const distanciaTiroSeleccionada = Number(categoriaSeleccionada?.distanciaTiro);
  const distanciaTiroMapa = Number.isFinite(distanciaTiroSeleccionada)
    ? distanciaTiroSeleccionada
    : null;
  const plazasMaximas = Number(formData.nroPlazaMax);
  const plazasMaximasValidas =
    formData.nroPlazaMax !== "" &&
    Number.isInteger(plazasMaximas) &&
    plazasMaximas >= 1 &&
    plazasMaximas <= 100;
  // El alto minimo se calcula por 6, para dar margen de posicionamiento 
  // para la colocación de las dianas, de forma que no es 100% restrictiva
  // La regla de los 5 metros es para que la linea de tiro no quede pegada a la zona de competencia, y se pueda colocar un espacio de seguridad
  const altoMinimo = plazasMaximas > 0 ? plazasMaximas * 6 : 0;
  const anchoMinimo = (distanciaTiroMapa ?? DEFAULT_ANCHO_MINIMO_MAPA)*1.2;

  useEffect(() => {
    let ignore = false;

    categoriaService
      .obtenerTodas()
      .then((data) => {
        if (!ignore) {
          setCategorias(data || []);
        }
      })
      .catch((err) => {
        console.error("Error al cargar categorias:", err);
        if (!ignore) {
          setError("No se pudieron cargar las categorias.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingCategorias(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!onMapRequirementsChange) return;

    onMapRequirementsChange({
      nroPlazaMax: plazasMaximasValidas ? plazasMaximas : null,
      distanciaTiroM: distanciaTiroMapa,
      minHeightM: plazasMaximasValidas ? altoMinimo : 0,
      minWidthM: anchoMinimo, // Se multiplica por 1.2 para dar un margen de seguridad y no quede pegado a los bordes del mapa
    });
  }, [
    altoMinimo,
    anchoMinimo,
    distanciaTiroMapa,
    onMapRequirementsChange,
    plazasMaximas,
    plazasMaximasValidas,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nroPlazaMax" && value !== "" && !/^[1-9]\d*$/.test(value)) {
      return;
    }

    setFormData({
      ...formData,
      [name]: name === "nroPlazaMax" && value !== "" ? Number(value) : value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nombreTorneo.trim()) {
      setError("El nombre del torneo es obligatorio");
      return;
    }

    if (!formData.idCategoria) {
      setError("Debe seleccionar una categoria");
      return;
    }

    if (!formData.fechaInicio || !formData.fechaTermino) {
      setError("Debe seleccionar las fechas");
      return;
    }

    if (formData.fechaInicio > formData.fechaTermino) {
      setError("La fecha de inicio no puede ser posterior a la de termino");
      return;
    }

    if (!plazasMaximasValidas) {
      setError("El numero de plazas maximo debe ser un entero entre 1 y 100.");
      return;
    }

    if (!zonaGeoJSON || !lineaGeoJSON) {
      setError("Debe definir la zona de competencia y la linea de tiro.");
      return;
    }

    setGuardando(true);

    try {
      await torneoService.crearTorneo({
        nombreTorneo: formData.nombreTorneo,
        idCategoria: parseInt(formData.idCategoria),
        fechaInicio: formData.fechaInicio,
        fechaTermino: formData.fechaTermino,
        nroPlazaMax: plazasMaximas,
        geomZonaCompetencia: JSON.stringify(zonaGeoJSON),
        lineaTiro: JSON.stringify(lineaGeoJSON),
      });

      const todos = await torneoService.obtenerTodos();
      const torneoCreado = todos
        .reverse()
        .find((t) => t.nombreTorneo === formData.nombreTorneo);

      if (torneoCreado) {
        const promesasRondas = [];
        for (let i = 1; i <= parseInt(formData.numeroRondas); i++) {
          promesasRondas.push(
            torneoService.crearRonda(torneoCreado.idTorneo, i),
          );
        }
        await Promise.all(promesasRondas);
      }

      setSuccess("Torneo creado exitosamente. Redirigiendo...");
      setTimeout(() => navigate("/admin/torneos"), 2000);
    } catch (err) {
      console.error("Error al crear torneo:", err);
      setError(err.response?.data?.message || "Error al crear el torneo.");
      setGuardando(false);
    }
  };

  if (loadingCategorias) {
    return (
      <div className="card shadow">
        <div className="card-body py-5 text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Crear Nuevo Torneo</h4>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => navigate("/admin/torneos")}
        >
          Volver
        </button>
      </div>
      <div className="card-body">
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

        {categorias.length === 0 && (
          <div className="alert alert-warning">
            No hay categorias disponibles.{" "}
            <button
              className="btn btn-sm btn-outline-warning ms-2"
              onClick={() => navigate("/admin/categorias")}
            >
              Ir a Categorias
            </button>
          </div>
        )}

        {!coordenadasCompletas && (
          <div className="alert alert-warning">
            Faltan coordenadas para crear la geometria del torneo.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h5 className="mb-3">Datos del Torneo</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Nombre del Torneo *</label>
              <input
                type="text"
                className="form-control"
                name="nombreTorneo"
                value={formData.nombreTorneo}
                onChange={handleChange}
                required
                placeholder="Ej: Copa Metropolitana 2026"
                disabled={guardando || categorias.length === 0}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Categoria *</label>
              <select
                className="form-select"
                name="idCategoria"
                value={formData.idCategoria}
                onChange={handleChange}
                required
                disabled={guardando || categorias.length === 0}
              >
                <option value="">Seleccione...</option>
                {categorias.map((categoria) => (
                  <option
                    key={categoria.idCategoria}
                    value={categoria.idCategoria}
                  >
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">N° Plazas *</label>
              <input
                type="number"
                className="form-control"
                name="nroPlazaMax"
                value={formData.nroPlazaMax}
                onChange={handleChange}
                min="1"
                max="100"
                step="1"
                required
                disabled={guardando || categorias.length === 0}
              />
              <small className="text-muted">
                Alto minimo: {altoMinimo}m · Ancho minimo: {anchoMinimo}m
              </small>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-bold">N° Rondas *</label>
              <input
                type="number"
                className="form-control"
                name="numeroRondas"
                value={formData.numeroRondas}
                onChange={handleChange}
                min="1"
                max="10"
                required
                disabled={guardando || categorias.length === 0}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Fecha Inicio *</label>
              <input
                type="date"
                className="form-control"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                required
                disabled={guardando || categorias.length === 0}
                min={minDate}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label fw-bold">Fecha Término *</label>
              <input
                type="date"
                className="form-control"
                name="fechaTermino"
                value={formData.fechaTermino}
                onChange={handleChange}
                required
                disabled={guardando || categorias.length === 0}
                min={formData.fechaInicio || minDate}
              />
            </div>
          </div>

          <h5 className="mb-3">Zona de Competencia</h5>
          <div className="row g-2 mb-3">
            {ZONA_FIELDS.map((field) => (
              <ReadonlyCoordinateGroup
                key={field.label}
                label={field.label}
                latValue={coordsZonaCompetencia[field.lat]}
                lngValue={coordsZonaCompetencia[field.lng]}
              />
            ))}
          </div>

          <h5 className="mb-3">Linea de Tiro</h5>
          <div className="row g-2 mb-4">
            {LINEA_FIELDS.map((field) => (
              <ReadonlyCoordinateGroup
                key={field.label}
                label={field.label}
                latValue={coordsLineaTiro[field.lat]}
                lngValue={coordsLineaTiro[field.lng]}
              />
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() => navigate("/admin/torneos")}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-dark"
              disabled={
                guardando || categorias.length === 0 || !coordenadasCompletas
              }
            >
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creando...
                </>
              ) : (
                "Crear Torneo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
