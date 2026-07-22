import { useCallback, useMemo, useState } from "react";

export const DEFAULT_COORDS_ZONA_COMPETENCIA = {
  lat1: "-33.45",
  lng1: "-70.636",
  lat2: "-33.45",
  lng2: "-70.632",
  lat3: "-33.446",
  lng3: "-70.632",
  lat4: "-33.446",
  lng4: "-70.636",
};

export const DEFAULT_COORDS_LINEA_TIRO = {
  latInicio: "-33.448",
  lngInicio: "-70.635",
  latFin: "-33.448",
  lngFin: "-70.633",
};

export const MAP_SELECTION_TARGETS = [
  { id: "zona1", label: "Zona P1", type: "zona" },
  { id: "zona2", label: "Zona P2", type: "zona" },
  { id: "zona3", label: "Zona P3", type: "zona" },
  { id: "zona4", label: "Zona P4", type: "zona" },
  { id: "lineaInicio", label: "Linea inicio", type: "linea" },
  { id: "lineaFin", label: "Linea fin", type: "linea" },
];

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatCoordinate(value) {
  const numberValue = toNumber(value);
  return numberValue === null ? "" : numberValue.toFixed(6);
}

function formatGeometryCoordinate(point, index) {
  return formatCoordinate(point?.[index]);
}

function pointFromFields(lng, lat) {
  const lngValue = toNumber(lng);
  const latValue = toNumber(lat);

  if (lngValue === null || latValue === null) return null;

  return {
    lng: lngValue,
    lat: latValue,
  };
}

function selectedMapPoint(point) {
  const lng = point?.lng ?? point?.lngLat?.lng;
  const lat = point?.lat ?? point?.lngLat?.lat;

  return pointFromFields(lng, lat);
}

function getSelectedPoint(targetId, coordsZona, coordsLinea) {
  switch (targetId) {
    case "zona1":
      return pointFromFields(coordsZona.lng1, coordsZona.lat1);
    case "zona2":
      return pointFromFields(coordsZona.lng2, coordsZona.lat2);
    case "zona3":
      return pointFromFields(coordsZona.lng3, coordsZona.lat3);
    case "zona4":
      return pointFromFields(coordsZona.lng4, coordsZona.lat4);
    case "lineaInicio":
      return pointFromFields(coordsLinea.lngInicio, coordsLinea.latInicio);
    case "lineaFin":
      return pointFromFields(coordsLinea.lngFin, coordsLinea.latFin);
    default:
      return null;
  }
}

export function coordsZonaToPolygon(coordsZona) {
  const points = [
    pointFromFields(coordsZona.lng1, coordsZona.lat1),
    pointFromFields(coordsZona.lng2, coordsZona.lat2),
    pointFromFields(coordsZona.lng3, coordsZona.lat3),
    pointFromFields(coordsZona.lng4, coordsZona.lat4),
  ];

  if (points.some((point) => !point)) return null;

  return {
    type: "Polygon",
    coordinates: [
      [
        [points[0].lng, points[0].lat],
        [points[1].lng, points[1].lat],
        [points[2].lng, points[2].lat],
        [points[3].lng, points[3].lat],
        [points[0].lng, points[0].lat],
      ],
    ],
  };
}

export function coordsLineaToLineString(coordsLinea) {
  const start = pointFromFields(coordsLinea.lngInicio, coordsLinea.latInicio);
  const end = pointFromFields(coordsLinea.lngFin, coordsLinea.latFin);

  if (!start || !end) return null;

  return {
    type: "LineString",
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ],
  };
}

function coordsZonaFromPolygon(geometry) {
  const ring = geometry?.coordinates?.[0];

  if (geometry?.type !== "Polygon" || !Array.isArray(ring) || ring.length < 4) {
    return null;
  }

  return {
    lat1: formatGeometryCoordinate(ring[0], 1),
    lng1: formatGeometryCoordinate(ring[0], 0),
    lat2: formatGeometryCoordinate(ring[1], 1),
    lng2: formatGeometryCoordinate(ring[1], 0),
    lat3: formatGeometryCoordinate(ring[2], 1),
    lng3: formatGeometryCoordinate(ring[2], 0),
    lat4: formatGeometryCoordinate(ring[3], 1),
    lng4: formatGeometryCoordinate(ring[3], 0),
  };
}

function coordsLineaFromLineString(geometry) {
  const coordinates = geometry?.coordinates;

  if (
    geometry?.type !== "LineString" ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2
  ) {
    return null;
  }

  return {
    latInicio: formatGeometryCoordinate(coordinates[0], 1),
    lngInicio: formatGeometryCoordinate(coordinates[0], 0),
    latFin: formatGeometryCoordinate(coordinates[1], 1),
    lngFin: formatGeometryCoordinate(coordinates[1], 0),
  };
}

function coordsZonaToPoints(coordsZona) {
  return [
    { point: pointFromFields(coordsZona.lng1, coordsZona.lat1), label: "P1" },
    { point: pointFromFields(coordsZona.lng2, coordsZona.lat2), label: "P2" },
    { point: pointFromFields(coordsZona.lng3, coordsZona.lat3), label: "P3" },
    { point: pointFromFields(coordsZona.lng4, coordsZona.lat4), label: "P4" },
  ]
    .filter(({ point }) => point)
    .map(({ point, label }) => ({
      lng: point.lng,
      lat: point.lat,
      properties: {
        label,
        kind: "zona",
      },
    }));
}

function coordsLineaToPoints(coordsLinea) {
  return [
    {
      point: pointFromFields(coordsLinea.lngInicio, coordsLinea.latInicio),
      label: "Inicio",
    },
    {
      point: pointFromFields(coordsLinea.lngFin, coordsLinea.latFin),
      label: "Fin",
    },
  ]
    .filter(({ point }) => point)
    .map(({ point, label }) => ({
      lng: point.lng,
      lat: point.lat,
      properties: {
        label,
        kind: "linea",
      },
    }));
}

export default function useTorneoMapSelection() {
  const [coordsZonaCompetencia, setCoordsZonaCompetencia] = useState(
    DEFAULT_COORDS_ZONA_COMPETENCIA,
  );
  const [coordsLineaTiro, setCoordsLineaTiro] = useState(
    DEFAULT_COORDS_LINEA_TIRO,
  );
  const [selectedTarget, setSelectedTarget] = useState("zona1");

  const selectedPoint = useMemo(() => {
    return getSelectedPoint(
      selectedTarget,
      coordsZonaCompetencia,
      coordsLineaTiro,
    );
  }, [coordsLineaTiro, coordsZonaCompetencia, selectedTarget]);

  const setSelectedPoint = useCallback(
    (point) => {
      const nextPoint = selectedMapPoint(point);

      if (!nextPoint) return;

      const lat = formatCoordinate(nextPoint.lat);
      const lng = formatCoordinate(nextPoint.lng);

      switch (selectedTarget) {
        case "zona1":
          setCoordsZonaCompetencia((coords) => ({ ...coords, lat1: lat, lng1: lng }));
          break;
        case "zona2":
          setCoordsZonaCompetencia((coords) => ({ ...coords, lat2: lat, lng2: lng }));
          break;
        case "zona3":
          setCoordsZonaCompetencia((coords) => ({ ...coords, lat3: lat, lng3: lng }));
          break;
        case "zona4":
          setCoordsZonaCompetencia((coords) => ({ ...coords, lat4: lat, lng4: lng }));
          break;
        case "lineaInicio":
          setCoordsLineaTiro((coords) => ({
            ...coords,
            latInicio: lat,
            lngInicio: lng,
          }));
          break;
        case "lineaFin":
          setCoordsLineaTiro((coords) => ({ ...coords, latFin: lat, lngFin: lng }));
          break;
      }
    },
    [selectedTarget],
  );

  const resetSelection = useCallback(() => {
    setCoordsZonaCompetencia(DEFAULT_COORDS_ZONA_COMPETENCIA);
    setCoordsLineaTiro(DEFAULT_COORDS_LINEA_TIRO);
    setSelectedTarget("zona1");
  }, []);

  const setGeometriasTorneo = useCallback((zonaCompetencia, lineaTiro) => {
    const nextCoordsZona = coordsZonaFromPolygon(zonaCompetencia);
    const nextCoordsLinea = coordsLineaFromLineString(lineaTiro);

    if (nextCoordsZona) {
      setCoordsZonaCompetencia(nextCoordsZona);
    }

    if (nextCoordsLinea) {
      setCoordsLineaTiro(nextCoordsLinea);
    }
  }, []);

  const zonaCompetenciaGeoJSON = useMemo(() => {
    return coordsZonaToPolygon(coordsZonaCompetencia);
  }, [coordsZonaCompetencia]);

  const lineaTiroGeoJSON = useMemo(() => {
    return coordsLineaToLineString(coordsLineaTiro);
  }, [coordsLineaTiro]);

  const puntosGeoJSON = useMemo(() => {
    return [
      ...coordsZonaToPoints(coordsZonaCompetencia),
      ...coordsLineaToPoints(coordsLineaTiro),
    ];
  }, [coordsLineaTiro, coordsZonaCompetencia]);

  return {
    coordsZonaCompetencia,
    coordsLineaTiro,
    selectedTarget,
    selectedPoint,
    zonaCompetenciaGeoJSON,
    lineaTiroGeoJSON,
    puntosGeoJSON,
    setSelectedTarget,
    setSelectedPoint,
    setGeometriasTorneo,
    resetSelection,
  };
}
