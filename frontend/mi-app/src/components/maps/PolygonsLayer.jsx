import { useEffect, useId, useMemo } from "react";
import { useMap } from "../../hooks/useMap";
import { toFeatureCollection } from "./geojson";

const DEFAULT_FILL_PAINT = {
  "fill-color": "#3b82f6",
  "fill-opacity": 0.25,
};

const DEFAULT_LINE_PAINT = {
  "line-color": "#2563eb",
  "line-width": 2,
};

const DEFAULT_LAYOUT = {};

function addLayer(map, layerConfig, beforeId) {
  if (beforeId) {
    map.addLayer(layerConfig, beforeId);
    return;
  }

  map.addLayer(layerConfig);
}

function removeLayer(map, layerId) {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

function removeSource(map, sourceId) {
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}

export default function PolygonsLayer({
  data,
  polygonData,
  polygonsData,
  id,
  beforeId,
  fillPaint,
  linePaint,
  fillLayout,
  lineLayout,
}) {
  const { map, ready } = useMap();
  const reactId = useId().replaceAll(":", "");
  const layerIdPrefix = id ?? `polygons-${reactId}`;
  const sourceId = `${layerIdPrefix}-source`;
  const fillLayerId = `${layerIdPrefix}-fill`;
  const lineLayerId = `${layerIdPrefix}-line`;
  const layerData = data ?? polygonsData ?? polygonData;

  const geojson = useMemo(() => {
    return toFeatureCollection(layerData, ["Polygon", "MultiPolygon"]);
  }, [layerData]);

  const polygonFillPaint = fillPaint ?? DEFAULT_FILL_PAINT;
  const polygonLinePaint = linePaint ?? DEFAULT_LINE_PAINT;
  const polygonFillLayout = fillLayout ?? DEFAULT_LAYOUT;
  const polygonLineLayout = lineLayout ?? DEFAULT_LAYOUT;

  useEffect(() => {
    if (!map || !ready || !geojson) return;

    removeLayer(map, lineLayerId);
    removeLayer(map, fillLayerId);
    removeSource(map, sourceId);

    map.addSource(sourceId, {
      type: "geojson",
      data: geojson,
    });

    addLayer(
      map,
      {
        id: fillLayerId,
        type: "fill",
        source: sourceId,
        paint: polygonFillPaint,
        layout: polygonFillLayout,
      },
      beforeId,
    );

    addLayer(
      map,
      {
        id: lineLayerId,
        type: "line",
        source: sourceId,
        paint: polygonLinePaint,
        layout: polygonLineLayout,
      },
      beforeId,
    );

    return () => {
      removeLayer(map, lineLayerId);
      removeLayer(map, fillLayerId);
      removeSource(map, sourceId);
    };
  }, [
    beforeId,
    fillLayerId,
    geojson,
    lineLayerId,
    map,
    polygonFillLayout,
    polygonFillPaint,
    polygonLineLayout,
    polygonLinePaint,
    ready,
    sourceId,
  ]);

  return null;
}

export function AddPolygonLayer(props) {
  return <PolygonsLayer {...props} />;
}
