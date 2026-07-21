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

export default function LinesLayer({
  data,
  id,
  beforeId,
  paint,
  layout,
}) {
  const { map, ready } = useMap();
  const reactId = useId().replaceAll(":", "");
  const layerIdPrefix = id ?? `lines-${reactId}`;
  const sourceId = `${layerIdPrefix}-source`;
  const layerId = `${layerIdPrefix}-line`;
  const layerData = data;

  const geojson = useMemo(() => {
    return toFeatureCollection(layerData, ["LineString", "MultiLineString"]);
  }, [layerData]);

  const layerPaint = paint ?? DEFAULT_PAINT;
  const layerLayout = layout ?? DEFAULT_LAYOUT;

  useEffect(() => {
    if (!map || !ready || !geojson) return;

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

    return () => {
      removeLayer(map, layerId);
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
  ]);

  return null;
}
