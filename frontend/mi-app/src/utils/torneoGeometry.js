import bearing from "@turf/bearing";
import destination from "@turf/destination";
import distance from "@turf/distance";

const METERS = { units: "meters" };
const DEFAULT_ROTATION_DEG = 90;
const DECIMAL_PLACES = 6;

function normalizeMeters(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0
    ? numberValue
    : fallback;
}

function roundCoordinate(value) {
  return Number(value.toFixed(DECIMAL_PLACES));
}

function roundPoint(point) {
  return [roundCoordinate(point[0]), roundCoordinate(point[1])];
}

function movePoint(origin, distanceMeters, bearingDegrees) {
  if (!distanceMeters) return origin;

  return destination(origin, distanceMeters, bearingDegrees, METERS).geometry
    .coordinates;
}

function offsetPoint(center, xMeters, yMeters, rotationDegrees) {
  const widthBearing = rotationDegrees;
  const heightBearing = rotationDegrees - 90;
  const shiftedX =
    xMeters === 0
      ? center
      : movePoint(
          center,
          Math.abs(xMeters),
          xMeters >= 0 ? widthBearing : widthBearing + 180,
        );

  return roundPoint(
    yMeters === 0
      ? shiftedX
      : movePoint(
          shiftedX,
          Math.abs(yMeters),
          yMeters >= 0 ? heightBearing : heightBearing + 180,
        ),
  );
}

function fourCornersFromGeometry(geometry) {
  if (geometry?.type !== "Polygon") return null;

  const ring = geometry.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 5) return null;

  const corners = ring.slice(0, 4);
  if (
    corners.some(
      (point) =>
        !Array.isArray(point) ||
        point.length < 2 ||
        !Number.isFinite(Number(point[0])) ||
        !Number.isFinite(Number(point[1])),
    )
  ) {
    return null;
  }

  return corners.map((point) => [Number(point[0]), Number(point[1])]);
}

export function createRectangleGeometry({
  center,
  widthM,
  heightM,
  rotationDeg = DEFAULT_ROTATION_DEG,
}) {
  const safeCenter = Array.isArray(center) ? center : [-70.634, -33.448];
  const safeWidthM = normalizeMeters(widthM, 1);
  const safeHeightM = normalizeMeters(heightM, 1);
  const halfWidth = safeWidthM / 2;
  const halfHeight = safeHeightM / 2;
  const p0 = offsetPoint(safeCenter, -halfWidth, -halfHeight, rotationDeg);
  const p1 = offsetPoint(safeCenter, halfWidth, -halfHeight, rotationDeg);
  const p2 = offsetPoint(safeCenter, halfWidth, halfHeight, rotationDeg);
  const p3 = offsetPoint(safeCenter, -halfWidth, halfHeight, rotationDeg);

  return {
    type: "Polygon",
    coordinates: [[p0, p1, p2, p3, p0]],
  };
}

export function createZoneFeature({
  id,
  center,
  widthM,
  heightM,
  rotationDeg,
}) {
  return {
    id,
    type: "Feature",
    properties: {
      label: "Zona de Competencia",
      mode: "zona",
    },
    geometry: createRectangleGeometry({
      center,
      widthM,
      heightM,
      rotationDeg,
    }),
  };
}

export function getRectangleDimensions(geometry) {
  const corners = fourCornersFromGeometry(geometry);
  if (!corners) return null;

  return {
    widthM:
      (distance(corners[0], corners[1], METERS) +
        distance(corners[3], corners[2], METERS)) /
      2,
    heightM:
      (distance(corners[1], corners[2], METERS) +
        distance(corners[0], corners[3], METERS)) /
      2,
  };
}

export function getRectangleCenter(geometry) {
  const corners = fourCornersFromGeometry(geometry);
  if (!corners) return null;

  const [lngSum, latSum] = corners.reduce(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1]],
    [0, 0],
  );

  return [lngSum / corners.length, latSum / corners.length];
}

export function getRectangleMeasurementLines(geometry) {
  const corners = fourCornersFromGeometry(geometry);
  const dimensions = getRectangleDimensions(geometry);

  if (!corners || !dimensions) return null;

  return {
    widthM: dimensions.widthM,
    heightM: dimensions.heightM,
    widthLine: {
      type: "LineString",
      coordinates: [corners[3], corners[2]],
    },
    heightLine: {
      type: "LineString",
      coordinates: [corners[1], corners[2]],
    },
  };
}

export function clampRectangleGeometry(geometry, minWidthM, minHeightM) {
  const corners = fourCornersFromGeometry(geometry);
  const dimensions = getRectangleDimensions(geometry);
  const center = getRectangleCenter(geometry);

  if (!corners || !dimensions || !center) {
    return { geometry, changed: false };
  }

  const safeMinWidthM = normalizeMeters(minWidthM);
  const safeMinHeightM = normalizeMeters(minHeightM);
  const nextWidthM = Math.max(dimensions.widthM, safeMinWidthM);
  const nextHeightM = Math.max(dimensions.heightM, safeMinHeightM);
  const widthChanged = Math.abs(nextWidthM - dimensions.widthM) > 0.05;
  const heightChanged = Math.abs(nextHeightM - dimensions.heightM) > 0.05;

  if (!widthChanged && !heightChanged) {
    return { geometry, changed: false };
  }

  return {
    changed: true,
    geometry: createRectangleGeometry({
      center,
      widthM: nextWidthM,
      heightM: nextHeightM,
      rotationDeg: bearing(corners[0], corners[1]),
    }),
  };
}

export function lineFromRectangleGeometry(geometry) {
  const corners = fourCornersFromGeometry(geometry);
  if (!corners) return null;

  return {
    type: "LineString",
    coordinates: [corners[3], corners[0]],
  };
}
