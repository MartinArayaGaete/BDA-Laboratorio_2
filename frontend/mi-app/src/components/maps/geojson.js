function parseGeoJson(value) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isCoordinatePair(value) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
}

function pointGeometryFromObject(value) {
  const lng = value.lng ?? value.lon ?? value.longitude;
  const lat = value.lat ?? value.latitude;

  if (!Number.isFinite(Number(lng)) || !Number.isFinite(Number(lat))) {
    return null;
  }

  return {
    type: "Point",
    coordinates: [Number(lng), Number(lat)],
  };
}

function featureFromGeometry(geometry, properties = {}) {
  return {
    type: "Feature",
    properties,
    geometry,
  };
}

function collectFeatures(value, allowedTypes) {
  const parsedValue = parseGeoJson(value);

  if (!parsedValue) return [];

  if (Array.isArray(parsedValue)) {
    if (allowedTypes.includes("Point") && isCoordinatePair(parsedValue)) {
      return [featureFromGeometry({
        type: "Point",
        coordinates: [Number(parsedValue[0]), Number(parsedValue[1])],
      })];
    }

    return parsedValue.flatMap((item) => collectFeatures(item, allowedTypes));
  }

  if (typeof parsedValue !== "object") return [];

  if (parsedValue.type === "FeatureCollection") {
    return collectFeatures(parsedValue.features, allowedTypes);
  }

  if (parsedValue.type === "Feature") {
    const geometry = parsedValue.geometry;

    if (!geometry || !allowedTypes.includes(geometry.type)) {
      return [];
    }

    return [
      {
        ...parsedValue,
        properties: parsedValue.properties ?? {},
      },
    ];
  }

  if (
    allowedTypes.includes(parsedValue.type) &&
    Array.isArray(parsedValue.coordinates)
  ) {
    return [
      featureFromGeometry(
        {
          type: parsedValue.type,
          coordinates: parsedValue.coordinates,
        },
        parsedValue.properties ?? {},
      ),
    ];
  }

  if (allowedTypes.includes("Point")) {
    const pointGeometry = pointGeometryFromObject(parsedValue);

    if (pointGeometry) {
      return [featureFromGeometry(pointGeometry, parsedValue.properties ?? {})];
    }
  }

  return [];
}

export function toFeatureCollection(value, allowedTypes) {
  const features = collectFeatures(value, allowedTypes);

  if (features.length === 0) return null;

  return {
    type: "FeatureCollection",
    features,
  };
}
