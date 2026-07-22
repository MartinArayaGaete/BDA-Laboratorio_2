// src/views/admin/CrearTorneoView.jsx
import { useCallback, useMemo, useState } from "react";
import FormCrearTorneo from "../../components/admin/FormCrearTorneo.jsx";
import Basemap from "../../components/maps/Basemap.jsx";
import LinesLayer from "../../components/maps/LinesLayer.jsx";
import PolygonsLayer from "../../components/maps/PolygonsLayer.jsx";
import TorneoZoneEditorLayer from "../../components/maps/TorneoZoneEditorLayer.jsx";
import useTorneoMapSelection from "../../hooks/useTorneoMapSelection.js";
import FitBoundsFromPolygonLayer from "../../components/maps/FitBoundsFromPolygonLayer.jsx";

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

const LINEA_PAINT = {
  "line-color": "#dc2626",
  "line-width": 3,
};

const LABEL_PAINT = {
  "text-color": "#111827",
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

export default function CrearTorneoView() {
  const [mapRequirements, setMapRequirements] = useState({
    minWidthM: 25,
    minHeightM: 50,
  });
  const [resetVersion, setResetVersion] = useState(0);
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
              <div
                className="border overflow-hidden"
                style={{ height: "520px", borderRadius: "8px" }}
              >
                <Basemap center={MAP_CENTER}>
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
                </Basemap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
