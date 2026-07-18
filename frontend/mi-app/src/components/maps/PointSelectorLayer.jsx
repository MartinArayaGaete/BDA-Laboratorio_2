import maplibregl from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import { useMap } from "../../hooks/useMap";
import { normalizeSelectedPoint } from "../../hooks/useSelectedPoint";

const DEFAULT_MARKER_COLOR = "#dc2626";
const SELECT_EVENTS = new Set(["click", "mousemove"]);

function mapEventToPoint(event) {
  const lngLat = event.lngLat.wrap();

  return {
    lng: lngLat.lng,
    lat: lngLat.lat,
    lngLat: {
      lng: lngLat.lng,
      lat: lngLat.lat,
    },
    screenPoint: {
      x: event.point.x,
      y: event.point.y,
    },
  };
}

export default function PointSelectorLayer({
  value,
  onChange,
  onMove,
  enabled = true,
  draggable = true,
  markerColor = DEFAULT_MARKER_COLOR,
  selectOn = "click",
}) {
  const { map, ready } = useMap();
  const markerRef = useRef(null);
  const markerOptionsRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onMoveRef = useRef(onMove);
  const selectedPoint = useMemo(() => normalizeSelectedPoint(value), [value]);
  const markerDraggable = Boolean(onChange) && draggable;
  const selectEvent = SELECT_EVENTS.has(selectOn) ? selectOn : "click";

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    if (!map || !ready || !enabled) return;

    const canvas = map.getCanvas();
    const previousCursor = canvas.style.cursor;

    canvas.style.cursor = "crosshair";

    const handleMouseMove = (event) => {
      const point = mapEventToPoint(event);

      onMoveRef.current?.(point);

      if (selectEvent === "mousemove") {
        onChangeRef.current?.(point);
      }
    };

    const handleClick = (event) => {
      if (selectEvent !== "click") return;

      onChangeRef.current?.(mapEventToPoint(event));
    };

    map.on("mousemove", handleMouseMove);
    map.on("click", handleClick);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("click", handleClick);
      canvas.style.cursor = previousCursor;
    };
  }, [map, ready, enabled, selectEvent]);

  useEffect(() => {
    if (!map || !ready) return;

    if (!selectedPoint) {
      markerRef.current?.remove();
      markerRef.current = null;
      markerOptionsRef.current = null;
      return;
    }

    const markerOptionsChanged =
      markerOptionsRef.current?.markerColor !== markerColor ||
      markerOptionsRef.current?.draggable !== markerDraggable;

    if (!markerRef.current || markerOptionsChanged) {
      markerRef.current?.remove();

      const marker = new maplibregl.Marker({
        color: markerColor,
        draggable: markerDraggable,
      })
        .setLngLat([selectedPoint.lng, selectedPoint.lat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat().wrap();
        onChangeRef.current?.({ lng: lngLat.lng, lat: lngLat.lat });
      });

      markerRef.current = marker;
      markerOptionsRef.current = { markerColor, draggable: markerDraggable };
      return;
    }

    markerRef.current.setLngLat([selectedPoint.lng, selectedPoint.lat]);
  }, [map, ready, selectedPoint, markerColor, markerDraggable]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      markerOptionsRef.current = null;
    };
  }, []);

  return null;
}
