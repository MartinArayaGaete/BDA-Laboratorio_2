// src/views/admin/CrearTorneoView.jsx
import FormCrearTorneo from "../../components/admin/FormCrearTorneo.jsx";
import Basemap from "../../components/maps/Basemap.jsx";
import LinesLayer from "../../components/maps/LinesLayer.jsx";
import PointSelectorLayer from "../../components/maps/PointSelectorLayer.jsx";
import PointsLayer from "../../components/maps/PointsLayer.jsx";
import PolygonsLayer from "../../components/maps/PolygonsLayer.jsx";
import useTorneoMapSelection, {
  MAP_SELECTION_TARGETS,
} from "../../hooks/useTorneoMapSelection.js";

const MAP_CENTER = [-70.634, -33.448];

const POINTS_PAINT = {
  "circle-radius": 7,
  "circle-color": [
    "match",
    ["get", "kind"],
    "linea",
    "#dc2626",
    "zona",
    "#2563eb",
    "#111827",
  ],
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 2,
};

const ZONA_FILL_PAINT = {
  "fill-color": "#2563eb",
  "fill-opacity": 0.18,
};

const ZONA_LINE_PAINT = {
  "line-color": "#1d4ed8",
  "line-width": 2,
};

const LINEA_PAINT = {
  "line-color": "#dc2626",
  "line-width": 3,
};

export default function CrearTorneoView() {
  const {
    coordsZonaCompetencia,
    coordsLineaTiro,
    selectedTarget,
    selectedPoint,
    zonaCompetenciaGeoJSON,
    lineaTiroGeoJSON,
    puntosGeoJSON,
    setSelectedTarget,
    setSelectedPoint,
    resetSelection,
  } = useTorneoMapSelection();

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        <div className="col-lg-7">
          <FormCrearTorneo
            coordsZonaCompetencia={coordsZonaCompetencia}
            coordsLineaTiro={coordsLineaTiro}
          />
        </div>

        <div className="col-lg-5">
          <div className="card shadow h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Mapa del Torneo</h4>
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                onClick={resetSelection}
              >
                Reiniciar
              </button>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {MAP_SELECTION_TARGETS.map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    className={`btn btn-sm ${
                      selectedTarget === target.id
                        ? "btn-dark"
                        : "btn-outline-dark"
                    }`}
                    onClick={() => setSelectedTarget(target.id)}
                  >
                    {target.label}
                  </button>
                ))}
              </div>

              <div
                className="border overflow-hidden"
                style={{ height: "520px", borderRadius: "8px" }}
              >
                <Basemap center={MAP_CENTER}>
                  <PolygonsLayer
                    id="crear-torneo-zona"
                    data={zonaCompetenciaGeoJSON}
                    fillPaint={ZONA_FILL_PAINT}
                    linePaint={ZONA_LINE_PAINT}
                  />
                  <LinesLayer
                    id="crear-torneo-linea"
                    data={lineaTiroGeoJSON}
                    paint={LINEA_PAINT}
                  />
                  <PointsLayer
                    id="crear-torneo-puntos"
                    data={puntosGeoJSON}
                    paint={POINTS_PAINT}
                  />
                  <PointSelectorLayer
                    value={selectedPoint}
                    onChange={setSelectedPoint}
                    markerColor="#111827"
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
