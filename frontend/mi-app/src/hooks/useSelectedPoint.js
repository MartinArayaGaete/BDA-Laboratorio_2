import { useCallback, useMemo, useState } from "react";

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function normalizeSelectedPoint(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return normalizeSelectedPoint(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (Array.isArray(value) && value.length >= 2) {
    const lng = toNumber(value[0]);
    const lat = toNumber(value[1]);
    return lng === null || lat === null ? null : { lng, lat };
  }

  if (value.type === "Point" && Array.isArray(value.coordinates)) {
    return normalizeSelectedPoint(value.coordinates);
  }

  const lng = toNumber(value.lng ?? value.lon ?? value.longitude);
  const lat = toNumber(value.lat ?? value.latitude);

  return lng === null || lat === null ? null : { lng, lat };
}

export function selectedPointToGeoJSON(point) {
  const normalizedPoint = normalizeSelectedPoint(point);

  if (!normalizedPoint) return null;

  return {
    type: "Point",
    coordinates: [normalizedPoint.lng, normalizedPoint.lat],
  };
}

export default function useSelectedPoint(initialPoint = null) {
  const [point, setPointState] = useState(() =>
    normalizeSelectedPoint(initialPoint),
  );

  const setPoint = useCallback((nextPoint) => {
    setPointState(normalizeSelectedPoint(nextPoint));
  }, []);

  const clearPoint = useCallback(() => {
    setPointState(null);
  }, []);

  const geoJSON = useMemo(() => selectedPointToGeoJSON(point), [point]);
  const geoJSONString = useMemo(() => {
    return geoJSON ? JSON.stringify(geoJSON) : "";
  }, [geoJSON]);

  return {
    point,
    setPoint,
    clearPoint,
    geoJSON,
    geoJSONString,
  };
}
