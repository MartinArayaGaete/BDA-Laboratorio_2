import { useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "../../hooks/useMap";
import {
  dianaAtDistance,
  isPointWithinZone,
  lineFeature,
  normalizeRoundPoint,
  placeArcherAheadOfShootingLine,
  pointFeature,
} from "../../utils/posicionesRonda";
import { isMapRemoved } from "./maplibreLifecycle";
import LinesLayer from "./LinesLayer";
import PointsLayer from "./PointsLayer";

const ARCHER_PAINT = {
  "circle-radius": 8,
  "circle-color": "#047857",
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 2,
};

const DIANA_PAINT = {
  "circle-radius": 8,
  "circle-color": "#b45309",
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 2,
};

const PREVIEW_PAINT = {
  "circle-radius": 6,
  "circle-color": "#ca8a04",
  "circle-opacity": 0.72,
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 2,
};

const REGISTERED_ARCHER_PAINT = {
  "circle-radius": 5,
  "circle-color": "#475569",
  "circle-opacity": 0.85,
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 1.5,
};

const REGISTERED_DIANA_PAINT = {
  "circle-radius": 5,
  "circle-color": "#64748b",
  "circle-opacity": 0.85,
  "circle-stroke-color": "#ffffff",
  "circle-stroke-width": 1.5,
};

const REGISTERED_LINE_PAINT = {
  "line-color": "#64748b",
  "line-width": 2,
  "line-opacity": 0.65,
};

const PREVIEW_LINE_PAINT = {
  "line-color": "#ca8a04",
  "line-width": 2,
  "line-dasharray": [2, 2],
};

const SELECTED_LINE_PAINT = {
  "line-color": "#0f766e",
  "line-width": 4,
};

const HIDDEN_LABEL_LAYOUT = {
  "text-field": "",
  "text-size": 1,
};

const DISTANCE_LABEL_PAINT = {
  "text-color": "#064e3b",
  "text-halo-color": "#ffffff",
  "text-halo-width": 2.5,
};

const DISTANCE_LABEL_LAYOUT = {
  "text-field": ["get", "label"],
  "text-size": 15,
  "text-anchor": "center",
  "text-allow-overlap": true,
};

function mapPoint(event) {
  const lngLat = event.lngLat.wrap();
  return { lng: lngLat.lng, lat: lngLat.lat };
}

function registeredPositionFeatures(positions) {
  return (Array.isArray(positions) ? positions : [])
    .map((position) => {
      const arquero = normalizeRoundPoint(
        position.posicion_arquero ?? position.posicionArquero,
      );
      const diana = normalizeRoundPoint(
        position.posicion_diana ?? position.posicionDiana,
      );
      const nombre = position.nombre ?? "Arquero registrado";

      return {
        arquero: pointFeature(arquero, { label: nombre }),
        diana: pointFeature(diana, { label: nombre }),
        linea: lineFeature(arquero, diana, { label: nombre }),
      };
    })
    .filter(({ arquero, diana, linea }) => arquero && diana && linea);
}

export default function ArcherDianaSelectorLayer({
  enabled,
  zone,
  shootingLine,
  distanceM,
  value,
  registeredPositions,
  onChange,
  onMessage,
}) {
  const { map, ready } = useMap();
  const [previewDiana, setPreviewDiana] = useState(null);
  const inputRef = useRef(null);
  const arquero = useMemo(
    () => normalizeRoundPoint(value?.arquero),
    [value?.arquero],
  );
  const diana = useMemo(
    () => normalizeRoundPoint(value?.diana),
    [value?.diana],
  );

  useEffect(() => {
    inputRef.current = {
      arquero,
      distanceM,
      zone,
      shootingLine,
      onChange,
      onMessage,
    };
  }, [arquero, distanceM, onChange, onMessage, shootingLine, zone]);

  useEffect(() => {
    if (!map || !ready || !enabled) {
      setPreviewDiana(null);
      return;
    }

    const canvas = map.getCanvas();
    const previousCursor = canvas.style.cursor;
    canvas.style.cursor = "crosshair";

    const getCandidateDiana = (event) => {
      const current = inputRef.current;
      if (!current?.arquero) return null;

      return dianaAtDistance(
        current.arquero,
        mapPoint(event),
        current.distanceM,
      );
    };

    const handleMove = (event) => {
      setPreviewDiana(getCandidateDiana(event));
    };

    const handleClick = (event) => {
      const current = inputRef.current;
      if (!current) return;

      if (!current.arquero) {
        const selectedArcher = placeArcherAheadOfShootingLine(
          mapPoint(event),
          current.shootingLine,
          current.zone,
        );

        if (!selectedArcher) {
          current.onMessage?.(
            "No se pudo ubicar al arquero a 0,5 m delante de la línea dentro de la zona.",
          );
          return;
        }

        current.onChange?.({ arquero: selectedArcher, diana: null });
        current.onMessage?.(
          "Arquero ubicado a 0,5 m delante de la línea de tiro. Ahora elige la dirección de la diana.",
        );
        return;
      }

      const selectedDiana = getCandidateDiana(event);
      if (!selectedDiana) {
        current.onMessage?.(
          "Elige una dirección distinta a la posición del arquero para ubicar la diana.",
        );
        return;
      }

      if (!isPointWithinZone(selectedDiana, current.zone)) {
        current.onMessage?.(
          "La diana calculada debe quedar dentro de la zona de competencia.",
        );
        return;
      }

      current.onChange?.({ arquero: current.arquero, diana: selectedDiana });
      current.onMessage?.(
        `Diana ubicada a ${current.distanceM} m del arquero.`,
      );
      setPreviewDiana(null);
    };

    map.on("mousemove", handleMove);
    map.on("click", handleClick);

    return () => {
      if (!isMapRemoved(map)) {
        map.off("mousemove", handleMove);
        map.off("click", handleClick);
        canvas.style.cursor = previousCursor;
      }
    };
  }, [enabled, map, ready]);

  const registeredFeatures = useMemo(
    () => registeredPositionFeatures(registeredPositions),
    [registeredPositions],
  );
  const registeredLines = useMemo(
    () => registeredFeatures.map(({ linea }) => linea),
    [registeredFeatures],
  );
  const registeredArchers = useMemo(
    () => registeredFeatures.map(({ arquero: point }) => point),
    [registeredFeatures],
  );
  const registeredDianas = useMemo(
    () => registeredFeatures.map(({ diana: point }) => point),
    [registeredFeatures],
  );
  const selectedLine = useMemo(
    () =>
      lineFeature(arquero, diana, {
        label: `${distanceM} m`,
      }),
    [arquero, diana, distanceM],
  );
  const previewLine = useMemo(
    () => lineFeature(arquero, previewDiana),
    [arquero, previewDiana],
  );
  const selectedArcher = useMemo(() => pointFeature(arquero), [arquero]);
  const selectedDiana = useMemo(() => pointFeature(diana), [diana]);
  const previewDianaFeature = useMemo(
    () => pointFeature(previewDiana),
    [previewDiana],
  );

  return (
    <>
      <LinesLayer
        id="ronda-posiciones-registradas"
        data={registeredLines}
        paint={REGISTERED_LINE_PAINT}
        labelLayout={HIDDEN_LABEL_LAYOUT}
      />
      <PointsLayer
        id="ronda-arqueros-registrados"
        data={registeredArchers}
        paint={REGISTERED_ARCHER_PAINT}
      />
      <PointsLayer
        id="ronda-dianas-registradas"
        data={registeredDianas}
        paint={REGISTERED_DIANA_PAINT}
      />
      <LinesLayer
        id="ronda-posicion-previsualizada"
        data={previewLine}
        paint={PREVIEW_LINE_PAINT}
        labelLayout={HIDDEN_LABEL_LAYOUT}
      />
      <LinesLayer
        id="ronda-posicion-seleccionada"
        data={selectedLine}
        paint={SELECTED_LINE_PAINT}
        labelPaint={DISTANCE_LABEL_PAINT}
        labelLayout={DISTANCE_LABEL_LAYOUT}
      />
      <PointsLayer
        id="ronda-arquero-seleccionado"
        data={selectedArcher}
        paint={ARCHER_PAINT}
      />
      <PointsLayer
        id="ronda-diana-seleccionada"
        data={selectedDiana}
        paint={DIANA_PAINT}
      />
      {!diana && (
        <PointsLayer
          id="ronda-diana-previsualizada"
          data={previewDianaFeature}
          paint={PREVIEW_PAINT}
        />
      )}
    </>
  );
}
