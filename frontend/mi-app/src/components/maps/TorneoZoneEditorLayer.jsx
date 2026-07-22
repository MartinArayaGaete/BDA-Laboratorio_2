import { useEffect, useId, useRef } from "react";
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { useMap } from "../../hooks/useMap";
import { isMapRemoved } from "./maplibreLifecycle";
import {
  clampRectangleGeometry,
  createZoneFeature,
  lineFromRectangleGeometry,
} from "../../utils/torneoGeometry";

const ZONA_FEATURE_ID = "8f6fd384-0f8d-4c33-9b6f-4eac42db42ea";
const DEFAULT_CENTER = [-70.634, -33.448];

const ZONA_MODE_STYLES = {
  fillColor: "#2563eb",
  fillOpacity: 0.18,
  outlineColor: "#1d4ed8",
  outlineOpacity: 1,
  outlineWidth: 2,
};

const SELECT_STYLES = {
  selectedPointColor: "#111827",
  selectedPointWidth: 7,
  selectedPointOpacity: 1,
  selectedPointOutlineColor: "#ffffff",
  selectedPointOutlineWidth: 2,
  selectedPointOutlineOpacity: 1,
  selectedMarkerUrl: "",
  selectedMarkerHeight: 24,
  selectedMarkerWidth: 24,
  selectedLineStringColor: "#111827",
  selectedLineStringWidth: 2,
  selectedLineStringOpacity: 1,
  selectedLineStringDash: [2, 2],
  selectedPolygonColor: "#2563eb",
  selectedPolygonFillOpacity: 0.22,
  selectedPolygonOutlineColor: "#111827",
  selectedPolygonOutlineOpacity: 1,
  selectedPolygonOutlineWidth: 2,
  selectionPointColor: "#111827",
  selectionPointWidth: 7,
  selectionPointOpacity: 1,
  selectionPointOutlineColor: "#ffffff",
  selectionPointOutlineWidth: 2,
  selectionPointOutlineOpacity: 1,
  midPointColor: "#2563eb",
  midPointWidth: 6,
  midPointOpacity: 1,
  midPointOutlineColor: "#ffffff",
  midPointOutlineWidth: 2,
  midPointOutlineOpacity: 1,
};

function emitGeometry(geometry, onGeometryChange) {
  onGeometryChange({
    zonaCompetencia: geometry,
    lineaTiro: lineFromRectangleGeometry(geometry),
  });
}

function addOrUpdateZone(draw, geometry, onGeometryChange, syncingRef) {
  const feature = createZoneFeature({
    id: ZONA_FEATURE_ID,
    center: DEFAULT_CENTER,
    widthM: 1,
    heightM: 1,
  });

  try {
    syncingRef.current = true;
    if (draw.hasFeature(ZONA_FEATURE_ID)) {
      draw.updateFeatureGeometry(ZONA_FEATURE_ID, geometry);
    } else {
      const results = draw.addFeatures([{ ...feature, geometry }]);
      const invalidResult = results.find((result) => !result.valid);

      if (invalidResult) {
        console.error("No se pudo crear la zona editable:", invalidResult.reason);
        return;
      }
    }
    draw.setMode("select");
    draw.selectFeature(ZONA_FEATURE_ID);
    emitGeometry(geometry, onGeometryChange);
  } finally {
    syncingRef.current = false;
  }
}

export default function TorneoZoneEditorLayer({
  minWidthM,
  minHeightM,
  defaultWidthM,
  defaultHeightM,
  resetVersion,
  onGeometryChange,
}) {
  const { map, ready } = useMap();
  const reactId = useId().replaceAll(":", "");
  const terraDrawPrefix = `crear-torneo-terra-${reactId}`;
  const drawRef = useRef(null);
  const syncingRef = useRef(false);
  const onGeometryChangeRef = useRef(onGeometryChange);
  const requirementsRef = useRef({
    minWidthM,
    minHeightM,
    defaultWidthM,
    defaultHeightM,
  });

  useEffect(() => {
    onGeometryChangeRef.current = onGeometryChange;
  }, [onGeometryChange]);

  useEffect(() => {
    requirementsRef.current = {
      minWidthM,
      minHeightM,
      defaultWidthM,
      defaultHeightM,
    };
  }, [defaultHeightM, defaultWidthM, minHeightM, minWidthM]);

  useEffect(() => {
    if (!map || !ready) return;

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({
        map,
        prefixId: terraDrawPrefix,
      }),
      modes: [
        new TerraDrawPolygonMode({
          modeName: "zona",
          styles: ZONA_MODE_STYLES,
        }),
        new TerraDrawSelectMode({
          styles: SELECT_STYLES,
          flags: {
            zona: {
              feature: {
                draggable: true,
                rotateable: true,
                scaleable: true,
                coordinates: {
                  midpoints: false,
                  draggable: false,
                  deletable: false,
                  resizable: "opposite",
                },
              },
            },
          },
        }),
      ],
    });

    const handleChange = () => {
      if (syncingRef.current) return;

      const feature = draw.getSnapshotFeature(ZONA_FEATURE_ID);
      if (feature?.geometry?.type !== "Polygon") return;

      const { minWidthM: currentMinWidth, minHeightM: currentMinHeight } =
        requirementsRef.current;
      const clamped = clampRectangleGeometry(
        feature.geometry,
        currentMinWidth,
        currentMinHeight,
      );

      if (clamped.changed) {
        syncingRef.current = true;
        draw.updateFeatureGeometry(ZONA_FEATURE_ID, clamped.geometry);
        syncingRef.current = false;
      }

      emitGeometry(clamped.geometry, onGeometryChangeRef.current);
    };

    draw.start();
    draw.setMode("select");
    draw.on("change", handleChange);
    drawRef.current = draw;

    const initialFeature = createZoneFeature({
      id: ZONA_FEATURE_ID,
      center: DEFAULT_CENTER,
      widthM: requirementsRef.current.defaultWidthM,
      heightM: requirementsRef.current.defaultHeightM,
    });

    addOrUpdateZone(
      draw,
      initialFeature.geometry,
      onGeometryChangeRef.current,
      syncingRef,
    );

    return () => {
      drawRef.current = null;
      syncingRef.current = true;

      try {
        draw.off("change", handleChange);

        if (!isMapRemoved(map)) {
          draw.stop();
        }
      } catch (error) {
        console.warn("No se pudo desmontar el editor de zona:", error);
      }
    };
  }, [map, ready, terraDrawPrefix]);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;

    const feature = draw.getSnapshotFeature(ZONA_FEATURE_ID);
    const geometry =
      feature?.geometry?.type === "Polygon"
        ? feature.geometry
        : createZoneFeature({
            id: ZONA_FEATURE_ID,
            center: DEFAULT_CENTER,
            widthM: defaultWidthM,
            heightM: defaultHeightM,
          }).geometry;
    const clamped = clampRectangleGeometry(geometry, minWidthM, minHeightM);

    addOrUpdateZone(
      draw,
      clamped.geometry,
      onGeometryChangeRef.current,
      syncingRef,
    );
  }, [defaultHeightM, defaultWidthM, minHeightM, minWidthM]);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    const { defaultWidthM: resetWidth, defaultHeightM: resetHeight } =
      requirementsRef.current;

    const feature = createZoneFeature({
      id: ZONA_FEATURE_ID,
      center: DEFAULT_CENTER,
      widthM: resetWidth,
      heightM: resetHeight,
    });

    addOrUpdateZone(
      draw,
      feature.geometry,
      onGeometryChangeRef.current,
      syncingRef,
    );
  }, [resetVersion]);

  return null;
}
