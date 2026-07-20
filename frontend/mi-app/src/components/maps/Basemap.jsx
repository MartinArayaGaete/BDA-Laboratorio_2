import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContext } from "../../hooks/useMap";
import { isMapRemoved } from "./maplibreLifecycle";

const DEFAULT_CENTER = [-70.6693, -33.4489];

export default function Basemap({ children, center = DEFAULT_CENTER }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const initialCenter = useRef(center);

  const [map, setMap] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: initialCenter.current,
      zoom: 12,
    });

    mapRef.current = mapInstance;
    setMap(mapInstance);

    const handleLoad = () => {
      setReady(true);
    };

    mapInstance.on("load", handleLoad);

    return () => {
      if (!isMapRemoved(mapInstance)) {
        mapInstance.off("load", handleLoad);
        mapInstance.remove();
      }

      mapRef.current = null;
    };
  }, []);

  const contextValue = useMemo(() => {
    return { map, ready };
  }, [map, ready]);

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {map && ready ? children : null}
    </MapContext.Provider>
  );
}
