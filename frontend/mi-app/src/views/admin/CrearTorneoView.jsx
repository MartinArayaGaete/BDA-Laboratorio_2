// src/views/admin/CrearTorneoView.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import apiMapas from "../../api/apiMapas.js";
import FormCrearTorneo from "../../components/admin/FormCrearTorneo.jsx";
import Basemap from "../../components/maps/Basemap.jsx";
import LinesLayer from "../../components/maps/LinesLayer.jsx";
import PolygonsLayer from "../../components/maps/PolygonsLayer.jsx";
import TorneoZoneEditorLayer from "../../components/maps/TorneoZoneEditorLayer.jsx";
import useTorneoMapSelection from "../../hooks/useTorneoMapSelection.js";
import { getRectangleMeasurementLines } from "../../utils/torneoGeometry.js";
import { backendResponseToFeatureCollection } from "../../components/maps/geojson.js";

const MAP_CENTER = [-70.634, -33.448];

const ZONA_LABEL_FILL_PAINT = {
  "fill-color": "#2563eb",
  "fill-opacity": 0,
};

const ZONA_LABEL_LINE_PAINT = {
  "line-color": "#1d4ed8",
  "line-opacity": 0,
  "line-width": 0,
};

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
  "fill-opacity": 0.35,
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

const LINEA_PAINT = {
  "line-color": "#dc2626",
  "line-width": 3,
};

const MEDIDAS_PAINT = {
  "line-color": "#f59e0b",
  "line-width": 2,
  "line-dasharray": [2, 2],
};

const LABEL_PAINT = {
  "text-color": "#111827",
  "text-halo-color": "#ffffff",
  "text-halo-width": 2,
};

const MEDIDAS_LABEL_PAINT = {
  "text-color": "#7c2d12",
  "text-halo-color": "#ffffff",
  "text-halo-width": 2,
};

const ZONA_LABEL_LAYOUT = {
  "text-field": ["coalesce", ["get", "label"], ""],
  "text-size": 14,
  "text-anchor": "bottom",
  "text-offset": [0, -0.8],
  "text-allow-overlap": true,
};

const LINEA_LABEL_LAYOUT = {
  "text-field": ["coalesce", ["get", "label"], ""],
  "text-size": 14,
  "text-anchor": "bottom",
  "text-offset": [0, -1],
  "text-allow-overlap": true,
};

const MEDIDAS_LABEL_LAYOUT = {
  "text-field": ["coalesce", ["get", "label"], ""],
  "text-size": 13,
  "text-anchor": "center",
  "text-offset": [0, 0.8],
  "text-allow-overlap": true,
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

function formatMeters(value) {
  if (!Number.isFinite(value)) return "0 m";

  return value < 10 ? `${value.toFixed(1)} m` : `${Math.round(value)} m`;
}

export default function CrearTorneoView() {
  const [mapRequirements, setMapRequirements] = useState({
    minWidthM: 25,
    minHeightM: 50,
  });
  const [resetVersion, setResetVersion] = useState(0);
  const [zonasAmbientales, setZonasAmbientales] = useState([]);
  const {
    coordsZonaCompetencia,
    coordsLineaTiro,
    zonaCompetenciaGeoJSON,
    lineaTiroGeoJSON,
    setGeometriasTorneo,
    resetSelection,
  } = useTorneoMapSelection();
  const mapDimensions = useMemo(() => {
    const minWidthM = Math.max(Number(mapRequirements.minWidthM) || 0, 0);
    const minHeightM = Math.max(Number(mapRequirements.minHeightM) || 0, 0);

    return {
      minWidthM,
      minHeightM,
      defaultWidthM: minWidthM > 0 ? minWidthM : 1,
      defaultHeightM: minHeightM > 0 ? minHeightM : 1,
    };
  }, [mapRequirements]);

  useEffect(() => {
    let ignore = false;

    apiMapas
      .obtenerZonasAmbientales()
      .then((zonas) => {
        if (!ignore) {
          setZonasAmbientales(Array.isArray(zonas) ? zonas : []);
        }
      })
      .catch(() => {
        if (!ignore) setZonasAmbientales([]);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleGeometryChange = useCallback(
    ({ zonaCompetencia, lineaTiro }) => {
      setGeometriasTorneo(zonaCompetencia, lineaTiro);
    },
    [setGeometriasTorneo],
  );

  const handleReset = useCallback(() => {
    resetSelection();
    setResetVersion((version) => version + 1);
  }, [resetSelection]);

  const zonaCompetenciaConLabel = useMemo(() => {
    if (!zonaCompetenciaGeoJSON) return null;

    return {
      type: "Feature",
      properties: {
        label: "Zona de Competencia",
      },
      geometry: zonaCompetenciaGeoJSON,
    };
  }, [zonaCompetenciaGeoJSON]);

  const lineaTiroConLabel = useMemo(() => {
    if (!lineaTiroGeoJSON) return null;

    return {
      type: "Feature",
      properties: {
        label: "Linea de tiro",
      },
      geometry: lineaTiroGeoJSON,
    };
  }, [lineaTiroGeoJSON]);

  const zonasAmbientalesGeoJSON = useMemo(
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

  const medidasZonaGeoJSON = useMemo(() => {
    const measurements = getRectangleMeasurementLines(zonaCompetenciaGeoJSON);
    if (!measurements) return null;

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            label: `Ancho: ${formatMeters(measurements.widthM)}`,
          },
          geometry: measurements.widthLine,
        },
        {
          type: "Feature",
          properties: {
            label: `Alto: ${formatMeters(measurements.heightM)}`,
          },
          geometry: measurements.heightLine,
        },
      ],
    };
  }, [zonaCompetenciaGeoJSON]);

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        <div className="col-lg-7">
          <FormCrearTorneo
            coordsZonaCompetencia={coordsZonaCompetencia}
            coordsLineaTiro={coordsLineaTiro}
            onMapRequirementsChange={setMapRequirements}
          />
        </div>

        <div className="col-lg-5">
          <div className="card shadow h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Mapa del Torneo</h4>
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                onClick={handleReset}
              >
                Reiniciar
              </button>
            </div>
            <div className="card-body">
              <div className="alert alert-info py-2 px-3 mb-3 small" role="note">
                Para rotar la zona, seleccionala y arrastrala manteniendo
                Control + R. Tambien puedes moverla arrastrandola y agrandarla
                desde sus esquinas.
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
              </div>
              <div
                className="border overflow-hidden"
                style={{ height: "520px", borderRadius: "8px" }}
              >
                <Basemap center={MAP_CENTER}>
                  <PolygonsLayer
                    id="crear-torneo-zonas-ambientales"
                    data={zonasAmbientalesGeoJSON}
                    fillPaint={AMBIENTAL_FILL_PAINT}
                    linePaint={AMBIENTAL_LINE_PAINT}
                    labelPaint={LABEL_PAINT}
                    labelLayout={AMBIENTAL_LABEL_LAYOUT}
                  />
                  <TorneoZoneEditorLayer
                    minWidthM={mapDimensions.minWidthM}
                    minHeightM={mapDimensions.minHeightM}
                    defaultWidthM={mapDimensions.defaultWidthM}
                    defaultHeightM={mapDimensions.defaultHeightM}
                    resetVersion={resetVersion}
                    onGeometryChange={handleGeometryChange}
                  />
                  <PolygonsLayer
                    id="crear-torneo-zona"
                    data={zonaCompetenciaConLabel}
                    fillPaint={ZONA_LABEL_FILL_PAINT}
                    linePaint={ZONA_LABEL_LINE_PAINT}
                    labelPaint={LABEL_PAINT}
                    labelLayout={ZONA_LABEL_LAYOUT}
                  />
                  <LinesLayer
                    id="crear-torneo-linea"
                    data={lineaTiroConLabel}
                    paint={LINEA_PAINT}
                    labelPaint={LABEL_PAINT}
                    labelLayout={LINEA_LABEL_LAYOUT}
                  />
                  <LinesLayer
                    id="crear-torneo-medidas"
                    data={medidasZonaGeoJSON}
                    paint={MEDIDAS_PAINT}
                    labelPaint={MEDIDAS_LABEL_PAINT}
                    labelLayout={MEDIDAS_LABEL_LAYOUT}
                  />
                </Basemap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
