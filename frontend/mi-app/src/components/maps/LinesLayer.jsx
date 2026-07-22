import { useEffect, useId, useMemo } from "react";
import { useMap } from "../../hooks/useMap";
import { toFeatureCollection } from "./geojson";
import { addLayer, removeLayer, removeSource } from "./maplibreLifecycle";

const DEFAULT_PAINT = {
  "line-color": "#dc2626",
  "line-width": 3,
};

const DEFAULT_LAYOUT = {
  "line-cap": "round",
  "line-join": "round",
};

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

export default function LinesLayer({
  data,
  id,
  beforeId,
  labelPaint,
  labelLayout,
  paint,
  layout,
}) {
  const { map, ready } = useMap();
  const reactId = useId().replaceAll(":", "");
  const layerIdPrefix = id ?? `lines-${reactId}`;
  const sourceId = `${layerIdPrefix}-source`;
  const layerId = `${layerIdPrefix}-line`;
  const labelLayerId = `${layerIdPrefix}-label`;
  const layerData = data;

  const lineLabelPaint = labelPaint ?? DEFAULT_LABEL_PAINT;
  const lineLabelLayout = labelLayout ?? DEFAULT_LABEL_LAYOUT;

  const geojson = useMemo(() => {
    return toFeatureCollection(layerData, ["LineString", "MultiLineString"]);
  }, [layerData]);

  const layerPaint = paint ?? DEFAULT_PAINT;
  const layerLayout = layout ?? DEFAULT_LAYOUT;

  useEffect(() => {
    if (!map || !ready || !geojson) return;

    removeLayer(map, labelLayerId);
    removeLayer(map, layerId);
    removeSource(map, sourceId);

    map.addSource(sourceId, {
      type: "geojson",
      data: geojson,
    });

    addLayer(
      map,
      {
        id: layerId,
        type: "line",
        source: sourceId,
        paint: layerPaint,
        layout: layerLayout,
      },
      beforeId,
    );

    addLayer(
      map,
      {
        id: labelLayerId,
        type: "symbol",
        source: sourceId,
        paint: lineLabelPaint,
        layout: lineLabelLayout,
      },
      beforeId,
    );

    return () => {
      removeLayer(map, layerId);
      removeLayer(map, labelLayerId);
      removeSource(map, sourceId);
    };
  }, [
    beforeId,
    geojson,
    layerId,
    layerLayout,
    layerPaint,
    map,
    ready,
    sourceId,
    labelLayerId,
    lineLabelPaint,
    lineLabelLayout,
  ]);

  return null;
}
