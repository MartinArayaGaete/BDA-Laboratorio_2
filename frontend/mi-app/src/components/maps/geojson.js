const GEOJSON_GEOMETRY_TYPES = [
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
];

// Acepta GeoJSON como objeto o como string JSON. Si el string no es valido,
// devuelve null para que los layers simplemente no dibujen nada.
function parseGeoJson(value) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Distingue objetos planos de arrays/null para evitar tratar coordenadas como
// objetos con campos.
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Detecta el caso compacto [lng, lat], usado para crear puntos rapidamente.
function isCoordinatePair(value) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
}

// Lee campos simples o anidados. Ejemplos: "nombreTorneo" o "categoria.nombre".
function getFieldValue(value, fieldName) {
  if (!fieldName || !isObject(value)) return undefined;

  return fieldName
    .split(".")
    .reduce((currentValue, field) => currentValue?.[field], value);
}

// Extrae una geometria GeoJSON valida desde una geometria pura o desde un Feature.
// Solo acepta los tipos indicados en allowedTypes.
function geometryFrom(value, allowedTypes) {
  const parsedValue = parseGeoJson(value);

  if (!isObject(parsedValue)) return null;

  if (parsedValue.type === "Feature") {
    return geometryFrom(parsedValue.geometry, allowedTypes);
  }

  if (
    allowedTypes.includes(parsedValue.type) &&
    Array.isArray(parsedValue.coordinates)
  ) {
    return {
      type: parsedValue.type,
      coordinates: parsedValue.coordinates,
    };
  }

  return null;
}

// Normaliza distintos formatos de entrada a una lista de Features:
// geometria pura, Feature, FeatureCollection, arrays de items, [lng, lat] y
// objetos tipo { lat, lng }.
function collectFeatures(value, allowedTypes) {
  const parsedValue = parseGeoJson(value);

  if (!parsedValue) return [];

  if (
    Array.isArray(parsedValue) &&
    !(allowedTypes.includes("Point") && isCoordinatePair(parsedValue))
  ) {
    return parsedValue.flatMap((item) => collectFeatures(item, allowedTypes));
  }

  if (isObject(parsedValue) && parsedValue.type === "FeatureCollection") {
    return collectFeatures(parsedValue.features, allowedTypes);
  }

  if (allowedTypes.includes("Point") && isCoordinatePair(parsedValue)) {
    return [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [Number(parsedValue[0]), Number(parsedValue[1])],
        },
      },
    ];
  }

  if (!isObject(parsedValue)) return [];

  const geometry = geometryFrom(parsedValue, allowedTypes);

  if (geometry) {
    return [
      {
        type: "Feature",
        properties: parsedValue.properties ?? {},
        geometry,
      },
    ];
  }

  if (allowedTypes.includes("Point")) {
    const lng = parsedValue.lng ?? parsedValue.lon ?? parsedValue.longitude;
    const lat = parsedValue.lat ?? parsedValue.latitude;

    if (Number.isFinite(Number(lng)) && Number.isFinite(Number(lat))) {
      return [
        {
          type: "Feature",
          properties: parsedValue.properties ?? {},
          geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
        },
      ];
    }
  }

  return [];
}

// Convierte un objeto de respuesta del backend en un Feature con properties.label.
// Busca la geometria en geometryField o, si no se entrega, en el primer campo que
// contenga una geometria GeoJSON valida.
function backendFeatureFromValue(value, titleField, allowedTypes, geometryField) {
  if (!isObject(value)) return null;

  let geometryEntry = null;

  if (geometryField) {
    const geometry = geometryFrom(getFieldValue(value, geometryField), allowedTypes);

    geometryEntry = geometry
      ? { field: geometryField.split(".")[0], geometry }
      : null;
  } else {
    for (const [field, fieldValue] of Object.entries(value)) {
      const geometry = geometryFrom(fieldValue, allowedTypes);

      if (geometry) {
        geometryEntry = { field, geometry };
        break;
      }
    }
  }

  if (!geometryEntry) return null;

  const properties = Object.entries(value).reduce(
    (backendProperties, [field, fieldValue]) => {
      const isGeometryField =
        field === geometryEntry.field ||
        Boolean(geometryFrom(fieldValue, GEOJSON_GEOMETRY_TYPES));

      if (!isGeometryField) backendProperties[field] = fieldValue;

      return backendProperties;
    },
    {},
  );
  const title = getFieldValue(value, titleField);

  return {
    type: "Feature",
    properties: {
      ...properties,
      label: title == null ? properties.label ?? "" : String(title),
    },
    geometry: geometryEntry.geometry,
  };
}

// Convierte GeoJSON ya formado o datos simples a un FeatureCollection listo para
// usar como source de MapLibre.
export function toFeatureCollection(value, allowedTypes) {
  const features = collectFeatures(value, allowedTypes);

  if (features.length === 0) return null;

  return {
    type: "FeatureCollection",
    features,
  };
}

// Convierte respuestas del backend a FeatureCollection y agrega properties.label
// usando titleField. geometryField es opcional; si no se entrega, se autodetecta.
export function backendResponseToFeatureCollection(
  value,
  titleField,
  allowedTypes = GEOJSON_GEOMETRY_TYPES,
  geometryField,
) {
  const collectBackendFeatures = (currentValue) => {
    const parsedValue = parseGeoJson(currentValue);

    if (!parsedValue) return [];

    if (Array.isArray(parsedValue)) {
      return parsedValue.flatMap(collectBackendFeatures);
    }

    const backendFeature = backendFeatureFromValue(
      parsedValue,
      titleField,
      allowedTypes,
      geometryField,
    );

    if (backendFeature) return [backendFeature];

    return collectFeatures(parsedValue, allowedTypes).map((feature) => {
      const title =
        getFieldValue(feature.properties, titleField) ??
        getFieldValue(feature, titleField) ??
        feature.properties?.label;

      return {
        ...feature,
        properties: {
          ...feature.properties,
          label: title == null ? "" : String(title),
        },
      };
    });
  };
  const features = collectBackendFeatures(value);

  if (features.length === 0) return null;

  return {
    type: "FeatureCollection",
    features,
  };
}
