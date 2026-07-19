import { useEffect, useId, useMemo } from "react";
import { useMap } from "../../hooks/useMap";
import { toFeatureCollection } from "./geojson";
import { addLayer, removeLayer, removeSource } from "./maplibreLifecycle";

const DEFAULT_PAINT = {
  "circle-radius": 7,
  "circle-color": "#ef4444",
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 2,
};

const DEFAULT_LAYOUT = {};

export default function PointsLayer({
  data,
  pointData,
  pointsData,
  id,
  beforeId,
  paint,
  layout,
}) {
  const { map, ready } = useMap();
  const reactId = useId().replaceAll(":", "");
  const layerIdPrefix = id ?? `points-${reactId}`;
  const sourceId = `${layerIdPrefix}-source`;
  const layerId = `${layerIdPrefix}-circle`;
  const layerData = data ?? pointsData ?? pointData;

  const geojson = useMemo(() => {
    return toFeatureCollection(layerData, ["Point", "MultiPoint"]);
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
        type: "circle",
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
