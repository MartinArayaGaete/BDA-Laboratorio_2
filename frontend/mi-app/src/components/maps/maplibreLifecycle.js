export function isMapRemoved(map) {
  return !map || map._removed;
}

export function addLayer(map, layerConfig, beforeId) {
  if (isMapRemoved(map)) return;

  if (beforeId && map.getLayer(beforeId)) {
    map.addLayer(layerConfig, beforeId);
    return;
  }

  map.addLayer(layerConfig);
}

export function removeLayer(map, layerId) {
  if (isMapRemoved(map)) return;

  try {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  } catch (error) {
    if (!isMapRemoved(map)) {
      throw error;
    }
  }
}

export function removeSource(map, sourceId) {
  if (isMapRemoved(map)) return;

  try {
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  } catch (error) {
    if (!isMapRemoved(map)) {
      throw error;
    }
  }
}
