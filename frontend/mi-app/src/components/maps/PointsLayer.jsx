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

const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: [],
};

export default function PointsLayer({
  data,
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
  const layerData = data;

  const geojson = useMemo(() => {
    return toFeatureCollection(layerData, ["Point", "MultiPoint"]);
  }, [layerData]);

  const layerPaint = paint ?? DEFAULT_PAINT;
  const layerLayout = layout ?? DEFAULT_LAYOUT;

  useEffect(() => {
    if (!map || !ready) return;

    removeLayer(map, layerId);
    removeSource(map, sourceId);

    map.addSource(sourceId, {
      type: "geojson",
      data: EMPTY_FEATURE_COLLECTION,
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
    layerId,
    layerLayout,
    layerPaint,
    map,
    ready,
    sourceId,
  ]);

  useEffect(() => {
    if (!map || !ready) return;

    const source = map.getSource(sourceId);
    source?.setData(geojson ?? EMPTY_FEATURE_COLLECTION);
  }, [geojson, map, ready, sourceId]);

  return null;
}
