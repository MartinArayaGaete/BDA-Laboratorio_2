import bearing from "@turf/bearing";
import destination from "@turf/destination";
import distance from "@turf/distance";

const METERS = { units: "meters" };
const EPSILON_METERS = 0.05;

function finiteNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function normalizeRoundPoint(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return normalizeRoundPoint(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (value.type === "Feature") return normalizeRoundPoint(value.geometry);

  if (value.type === "Point" && Array.isArray(value.coordinates)) {
    return normalizeRoundPoint(value.coordinates);
  }

  if (Array.isArray(value) && value.length >= 2) {
    const lng = finiteNumber(value[0]);
    const lat = finiteNumber(value[1]);
    return lng === null || lat === null ? null : { lng, lat };
  }

  const lng = finiteNumber(value.lng ?? value.longitude ?? value.lon);
  const lat = finiteNumber(value.lat ?? value.latitude);
  return lng === null || lat === null ? null : { lng, lat };
}

export function pointToGeoJSONString(point) {
  const normalizedPoint = normalizeRoundPoint(point);

  if (!normalizedPoint) return null;

  return JSON.stringify({
    type: "Point",
    coordinates: [normalizedPoint.lng, normalizedPoint.lat],
  });
}

export function parseGeometry(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return parseGeometry(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (value.type === "Feature") return parseGeometry(value.geometry);
  return value?.type && Array.isArray(value.coordinates) ? value : null;
}

function pointToCoordinates(point) {
  return [point.lng, point.lat];
}

function segmentDistanceMeters(point, start, end) {
  const startPoint = normalizeRoundPoint(start);
  const endPoint = normalizeRoundPoint(end);
  if (!startPoint || !endPoint) return null;

  const midpointLat = (startPoint.lat + endPoint.lat + point.lat) / 3;
  const latMeters = 111320;
  const lngMeters = latMeters * Math.cos((midpointLat * Math.PI) / 180);
  if (lngMeters === 0) return null;

  const startXY = [startPoint.lng * lngMeters, startPoint.lat * latMeters];
  const endXY = [endPoint.lng * lngMeters, endPoint.lat * latMeters];
  const pointXY = [point.lng * lngMeters, point.lat * latMeters];
  const dx = endXY[0] - startXY[0];
  const dy = endXY[1] - startXY[1];
  const lengthSquared = dx * dx + dy * dy;
  const factor =
    lengthSquared === 0
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            ((pointXY[0] - startXY[0]) * dx + (pointXY[1] - startXY[1]) * dy) /
              lengthSquared,
          ),
        );
  const nearest = {
    lng: (startXY[0] + factor * dx) / lngMeters,
    lat: (startXY[1] + factor * dy) / latMeters,
  };

  return {
    point: nearest,
    distanceM: distance(pointToCoordinates(point), pointToCoordinates(nearest), METERS),
    start: startPoint,
    end: endPoint,
  };
}

function lineSegments(geometry) {
  if (geometry?.type === "LineString") {
    return [geometry.coordinates];
  }

  if (geometry?.type === "MultiLineString") {
    return geometry.coordinates;
  }

  return [];
}

function closestPointOnShootingLine(pointValue, lineValue) {
  const point = normalizeRoundPoint(pointValue);
  const line = parseGeometry(lineValue);
  if (!point || !line) return null;

  let nearest = null;

  for (const coordinates of lineSegments(line)) {
    for (let index = 0; index < coordinates.length - 1; index += 1) {
      const candidate = segmentDistanceMeters(
        point,
        coordinates[index],
        coordinates[index + 1],
      );

      if (!candidate || (nearest && candidate.distanceM >= nearest.distanceM)) {
        continue;
      }

      nearest = candidate;
    }
  }

  return nearest;
}

export function snapPointToShootingLine(pointValue, lineValue) {
  return closestPointOnShootingLine(pointValue, lineValue)?.point ?? null;
}

export function placeArcherAheadOfShootingLine(
  pointValue,
  lineValue,
  zoneValue,
  offsetMeters = 0.5,
) {
  const selectedPoint = normalizeRoundPoint(pointValue);
  const nearest = closestPointOnShootingLine(selectedPoint, lineValue);
  const offset = finiteNumber(offsetMeters);
  if (!selectedPoint || !nearest || offset === null || offset <= 0) return null;

  const lineBearing = bearing(
    pointToCoordinates(nearest.start),
    pointToCoordinates(nearest.end),
  );
  const candidates = [lineBearing + 90, lineBearing - 90]
    .map((heading) =>
      normalizeRoundPoint(
        destination(pointToCoordinates(nearest.point), offset, heading, METERS)
          .geometry.coordinates,
      ),
    )
    .filter((candidate) => isPointWithinZone(candidate, zoneValue));

  if (candidates.length === 0) return null;

  return candidates.reduce((closestCandidate, candidate) =>
    distance(
      pointToCoordinates(selectedPoint),
      pointToCoordinates(candidate),
      METERS,
    ) <
    distance(
      pointToCoordinates(selectedPoint),
      pointToCoordinates(closestCandidate),
      METERS,
    )
      ? candidate
      : closestCandidate,
  );
}

function pointOnSegment(point, start, end) {
  const projected = segmentDistanceMeters(point, start, end);
  return projected !== null && projected.distanceM <= EPSILON_METERS;
}

function isPointInRing(point, ring) {
  if (!Array.isArray(ring) || ring.length < 4) return false;

  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const currentPoint = normalizeRoundPoint(ring[index]);
    const previousPoint = normalizeRoundPoint(ring[previous]);
    if (!currentPoint || !previousPoint) return false;

    if (pointOnSegment(point, previousPoint, currentPoint)) return true;

    const intersects =
      (currentPoint.lat > point.lat) !== (previousPoint.lat > point.lat) &&
      point.lng <
        ((previousPoint.lng - currentPoint.lng) * (point.lat - currentPoint.lat)) /
          (previousPoint.lat - currentPoint.lat) +
          currentPoint.lng;

    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInPolygon(point, coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return false;
  if (!isPointInRing(point, coordinates[0])) return false;

  return !coordinates.slice(1).some((ring) => isPointInRing(point, ring));
}

export function isPointWithinZone(pointValue, zoneValue) {
  const point = normalizeRoundPoint(pointValue);
  const zone = parseGeometry(zoneValue);
  if (!point || !zone) return false;

  if (zone.type === "Polygon") return pointInPolygon(point, zone.coordinates);

  if (zone.type === "MultiPolygon") {
    return zone.coordinates.some((polygon) => pointInPolygon(point, polygon));
  }

  return false;
}

export function dianaAtDistance(arqueroValue, directionValue, distanceM) {
  const arquero = normalizeRoundPoint(arqueroValue);
  const direction = normalizeRoundPoint(directionValue);
  const requiredDistance = finiteNumber(distanceM);
  if (!arquero || !direction || requiredDistance === null || requiredDistance <= 0) {
    return null;
  }

  if (distance(pointToCoordinates(arquero), pointToCoordinates(direction), METERS) <= EPSILON_METERS) {
    return null;
  }

  const heading = bearing(pointToCoordinates(arquero), pointToCoordinates(direction));
  const calculated = destination(
    pointToCoordinates(arquero),
    requiredDistance,
    heading,
    METERS,
  ).geometry.coordinates;

  return normalizeRoundPoint(calculated);
}

export function pointFeature(pointValue, properties = {}) {
  const point = normalizeRoundPoint(pointValue);
  if (!point) return null;

  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Point",
      coordinates: pointToCoordinates(point),
    },
  };
}

export function lineFeature(startValue, endValue, properties = {}) {
  const start = normalizeRoundPoint(startValue);
  const end = normalizeRoundPoint(endValue);
  if (!start || !end) return null;

  return {
    type: "Feature",
    properties,
    geometry: {
      type: "LineString",
      coordinates: [pointToCoordinates(start), pointToCoordinates(end)],
    },
  };
}
