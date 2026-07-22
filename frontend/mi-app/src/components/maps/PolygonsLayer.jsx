import { useEffect, useId, useMemo } from "react";
import { useMap } from "../../hooks/useMap";
import { toFeatureCollection } from "./geojson";
import { addLayer, removeLayer, removeSource } from "./maplibreLifecycle";

const DEFAULT_FILL_PAINT = {
  "fill-color": "#3b82f6",
  "fill-opacity": 0.25,
};

const DEFAULT_LINE_PAINT = {
  "line-color": "#2563eb",
  "line-width": 2,
};

const DEFAULT_LAYOUT = {};

const DEFAULT_LABEL_PAINT = {
  "text-color": "#111827",
  "text-halo-color": "#ffffff",
  "text-halo-width": 1.5,
};

const DEFAULT_LABEL_LAYOUT = {
  "text-field": ["coalesce", ["get", "label"], ""],
  "text-size": 14,
  "text-anchor": "center",
  "text-allow-overlap": true,
};

export default function PolygonsLayer({
  data,
  id,
  beforeId,
  fillPaint,
  linePaint,
  labelPaint,
  labelLayout,
  fillLayout,
  lineLayout,
}) {
  const { map, ready } = useMap();
  const reactId = useId().replaceAll(":", "");
  const layerIdPrefix = id ?? `polygons-${reactId}`;
  const sourceId = `${layerIdPrefix}-source`;
  const fillLayerId = `${layerIdPrefix}-fill`;
  const lineLayerId = `${layerIdPrefix}-line`;
  const labelLayerId = `${layerIdPrefix}-label`;
  const layerData = data;

  const geojson = useMemo(() => {
    return toFeatureCollection(layerData, ["Polygon", "MultiPolygon"]);
  }, [layerData]);

  const polygonFillPaint = fillPaint ?? DEFAULT_FILL_PAINT;
  const polygonLinePaint = linePaint ?? DEFAULT_LINE_PAINT;
  const polygonFillLayout = fillLayout ?? DEFAULT_LAYOUT;
  const polygonLineLayout = lineLayout ?? DEFAULT_LAYOUT;

  const polygonLabelPaint = labelPaint ?? DEFAULT_LABEL_PAINT;
  const polygonLabelLayout = labelLayout ?? DEFAULT_LABEL_LAYOUT;

  useEffect(() => {
    if (!map || !ready || !geojson) return;

    removeLayer(map, labelLayerId);
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

    addLayer(
      map,
      {
        id: labelLayerId,
        type: "symbol",
        source: sourceId,
        paint: polygonLabelPaint,
        layout: polygonLabelLayout,
      },
      beforeId,
    );

    return () => {
      removeLayer(map, labelLayerId);
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
    labelLayerId,
    polygonLabelPaint,
    polygonLabelLayout,
  ]);

  return null;
}

export function AddPolygonLayer(props) {
  return <PolygonsLayer {...props} />;
}
