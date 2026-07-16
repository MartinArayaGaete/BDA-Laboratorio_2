// src/components/admin/FormCrearTorneo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import torneoService from "../../api/apiTorneos.js";
import categoriaService from "../../api/apiCategorias.js";

export default function FormCrearTorneo() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [formData, setFormData] = useState({
    nombreTorneo: "",
    idCategoria: "",
    fechaInicio: "",
    fechaTermino: "",
    numeroRondas: 1,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Coordenadas de la zona de competencia (4 puntos del polígono)
  const [coordsZona, setCoordsZona] = useState({
    lat1: "-33.45",
    lng1: "-70.636",
    lat2: "-33.45",
    lng2: "-70.632",
    lat3: "-33.446",
    lng3: "-70.632",
    lat4: "-33.446",
    lng4: "-70.636",
  });

  // Coordenadas de la línea de tiro (2 puntos)
  const [coordsLinea, setCoordsLinea] = useState({
    latInicio: "-33.448",
    lngInicio: "-70.635",
    latFin: "-33.448",
    lngFin: "-70.633",
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const data = await categoriaService.obtenerTodas();
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleCoordsZonaChange = (e) => {
    setCoordsZona({ ...coordsZona, [e.target.name]: e.target.value });
  };

  const handleCoordsLineaChange = (e) => {
    setCoordsLinea({ ...coordsLinea, [e.target.name]: e.target.value });
  };

  const aplicarPresetSantiago = () => {
    setCoordsZona({
      lat1: "-33.45",
      lng1: "-70.636",
      lat2: "-33.45",
      lng2: "-70.632",
      lat3: "-33.446",
      lng3: "-70.632",
      lat4: "-33.446",
      lng4: "-70.636",
    });
    setCoordsLinea({
      latInicio: "-33.448",
      lngInicio: "-70.635",
      latFin: "-33.448",
      lngFin: "-70.633",
    });
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
      setError("Debe seleccionar una categoría");
      return;
    }
    if (!formData.fechaInicio || !formData.fechaTermino) {
      setError("Debe seleccionar las fechas");
      return;
    }
    if (formData.fechaInicio > formData.fechaTermino) {
      setError("La fecha de inicio no puede ser posterior a la de término");
      return;
    }

    // Construir GeoJSON de la zona de competencia
    const geomZonaCompetencia = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          [parseFloat(coordsZona.lng1), parseFloat(coordsZona.lat1)],
          [parseFloat(coordsZona.lng2), parseFloat(coordsZona.lat2)],
          [parseFloat(coordsZona.lng3), parseFloat(coordsZona.lat3)],
          [parseFloat(coordsZona.lng4), parseFloat(coordsZona.lat4)],
          [parseFloat(coordsZona.lng1), parseFloat(coordsZona.lat1)], // Cerrar polígono
        ],
      ],
    });

    // Construir GeoJSON de la línea de tiro
    const lineaTiro = JSON.stringify({
      type: "LineString",
      coordinates: [
        [parseFloat(coordsLinea.lngInicio), parseFloat(coordsLinea.latInicio)],
        [parseFloat(coordsLinea.lngFin), parseFloat(coordsLinea.latFin)],
      ],
    });

    setGuardando(true);
    try {
      await torneoService.crearTorneo({
        nombreTorneo: formData.nombreTorneo,
        idCategoria: parseInt(formData.idCategoria),
        fechaInicio: formData.fechaInicio,
        fechaTermino: formData.fechaTermino,
        geomZonaCompetencia,
        lineaTiro,
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

      setSuccess("¡Torneo creado exitosamente! Redirigiendo...");
      setTimeout(() => navigate("/admin/torneos"), 2000);
    } catch (err) {
      console.error("Error al crear torneo:", err);
      setError(err.response?.data?.message || "Error al crear el torneo.");
      setGuardando(false);
    }
  };

  if (loadingCategorias) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow mx-auto" style={{ maxWidth: "800px" }}>
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Crear Nuevo Torneo</h4>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => navigate("/admin/torneos")}
          >
            ← Volver
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
              No hay categorías disponibles.{" "}
              <button
                className="btn btn-sm btn-outline-warning ms-2"
                onClick={() => navigate("/admin/categorias")}
              >
                Ir a Categorías
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Datos básicos */}
            <h5 className="mb-3">📋 Datos del Torneo</h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  Nombre del Torneo *
                </label>
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
                <label className="form-label fw-bold">Categoría *</label>
                <select
                  className="form-select"
                  name="idCategoria"
                  value={formData.idCategoria}
                  onChange={handleChange}
                  required
                  disabled={guardando || categorias.length === 0}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((c) => (
                    <option key={c.idCategoria} value={c.idCategoria}>
                      {c.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Fecha Inicio *</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  required
                  disabled={guardando || categorias.length === 0}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Fecha Término *</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaTermino"
                  value={formData.fechaTermino}
                  onChange={handleChange}
                  required
                  disabled={guardando || categorias.length === 0}
                  min={
                    formData.fechaInicio ||
                    new Date().toISOString().split("T")[0]
                  }
                />
              </div>
            </div>

            {/* Zona de Competencia */}
            <h5 className="mb-3">
              🗺️ Zona de Competencia (Polígono - 4 puntos)
            </h5>
            <div className="row g-2 mb-3">
              <div className="col-md-3">
                <label className="form-label small">Punto 1 (Sup-Izq)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Lat"
                  name="lat1"
                  value={coordsZona.lat1}
                  onChange={handleCoordsZonaChange}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Lng"
                  name="lng1"
                  value={coordsZona.lng1}
                  onChange={handleCoordsZonaChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Punto 2 (Sup-Der)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Lat"
                  name="lat2"
                  value={coordsZona.lat2}
                  onChange={handleCoordsZonaChange}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Lng"
                  name="lng2"
                  value={coordsZona.lng2}
                  onChange={handleCoordsZonaChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Punto 3 (Inf-Der)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Lat"
                  name="lat3"
                  value={coordsZona.lat3}
                  onChange={handleCoordsZonaChange}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Lng"
                  name="lng3"
                  value={coordsZona.lng3}
                  onChange={handleCoordsZonaChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Punto 4 (Inf-Izq)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Lat"
                  name="lat4"
                  value={coordsZona.lat4}
                  onChange={handleCoordsZonaChange}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Lng"
                  name="lng4"
                  value={coordsZona.lng4}
                  onChange={handleCoordsZonaChange}
                />
              </div>
            </div>

            {/* Línea de Tiro */}
            <h5 className="mb-3">🎯 Línea de Tiro (2 puntos)</h5>
            <div className="row g-2 mb-4">
              <div className="col-md-6">
                <label className="form-label small">Punto Inicio</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Lat"
                  name="latInicio"
                  value={coordsLinea.latInicio}
                  onChange={handleCoordsLineaChange}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Lng"
                  name="lngInicio"
                  value={coordsLinea.lngInicio}
                  onChange={handleCoordsLineaChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Punto Fin</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Lat"
                  name="latFin"
                  value={coordsLinea.latFin}
                  onChange={handleCoordsLineaChange}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-1"
                  placeholder="Lng"
                  name="lngFin"
                  value={coordsLinea.lngFin}
                  onChange={handleCoordsLineaChange}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={aplicarPresetSantiago}
            >
              📍 Usar coordenadas de Santiago (preset)
            </button>

            <div className="alert alert-info small">
              <strong>ℹ️ Formato:</strong> Latitud y Longitud en grados
              decimales (WGS 84). Ej: Lat: -33.448, Lng: -70.634
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/admin/torneos")}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-dark"
                disabled={guardando || categorias.length === 0}
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
    </div>
  );
}
