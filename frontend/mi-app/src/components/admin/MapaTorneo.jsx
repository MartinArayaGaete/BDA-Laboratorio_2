// src/components/admin/MapaTorneo.jsx
import React, { useEffect, useRef, useState } from "react";

export default function MapaTorneo({ torneo, inscritos }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef([]);
  const [error, setError] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    if (!window.L) {
      setError("Leaflet no está disponible. Recargue la página.");
      return;
    }

    const L = window.L;
    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([-33.448, -70.634], 17);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapInstance.current = map;
      setMapReady(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Actualizar capas
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapReady || !window.L) return;
    const L = window.L;

    // Limpiar capas anteriores
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    // Dibujar zona de competencia
    if (torneo?.geomZonaCompetencia) {
      try {
        const zona = JSON.parse(torneo.geomZonaCompetencia);
        if (zona.type === "Polygon" && zona.coordinates?.[0]) {
          const coords = zona.coordinates[0].map((c) => [c[1], c[0]]);
          const polygon = L.polygon(coords, {
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 2,
          }).addTo(map);
          polygon.bindPopup(
            "<strong>Zona de Competencia</strong><br/>Área válida para arqueros",
          );
          layersRef.current.push(polygon);
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch (e) {
        console.error("Error parseando zona:", e);
      }
    }

    // Iconos
    const iconoArquero = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const iconoBlanco = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Dibujar arqueros
    if (inscritos && inscritos.length > 0) {
      inscritos.forEach((inscrito) => {
        try {
          // Posición del arquero
          if (inscrito?.ubicacionArquero) {
            const punto = JSON.parse(inscrito.ubicacionArquero);
            if (punto.type === "Point" && punto.coordinates?.length === 2) {
              const pos = [punto.coordinates[1], punto.coordinates[0]];

              // Marcador del arquero (verde)
              const marker = L.marker(pos, { icon: iconoArquero }).addTo(map);
              marker.bindPopup(`
                <strong>🎯 ${inscrito.nombre || "Arquero"}</strong><br/>
                RUT: ${inscrito.rut || "N/A"}<br/>
                <small>Lat: ${pos[0].toFixed(6)} | Lng: ${pos[1].toFixed(6)}</small>
              `);
              layersRef.current.push(marker);

              // Radio de seguridad
              const circle = L.circle(pos, {
                radius: 1.5,
                color: "#ef4444",
                fillColor: "#fca5a5",
                fillOpacity: 0.1,
                weight: 1,
              }).addTo(map);
              circle.bindPopup("Radio de seguridad: 1.5 metros");
              layersRef.current.push(circle);

              // Línea hacia el blanco
              if (inscrito?.ubicacionBlanco) {
                const blanco = JSON.parse(inscrito.ubicacionBlanco);
                if (
                  blanco.type === "Point" &&
                  blanco.coordinates?.length === 2
                ) {
                  const posBlanco = [
                    blanco.coordinates[1],
                    blanco.coordinates[0],
                  ];

                  // Marcador del blanco (rojo)
                  const markerBlanco = L.marker(posBlanco, {
                    icon: iconoBlanco,
                  }).addTo(map);
                  markerBlanco.bindPopup(`
                    <strong>🏹 Blanco de ${inscrito.nombre || "Arquero"}</strong><br/>
                    <small>Lat: ${posBlanco[0].toFixed(6)} | Lng: ${posBlanco[1].toFixed(6)}</small>
                  `);
                  layersRef.current.push(markerBlanco);

                  // Línea punteada del arquero al blanco
                  const linea = L.polyline([pos, posBlanco], {
                    color: "#8b5cf6",
                    weight: 1,
                    dashArray: "5, 5",
                    opacity: 0.6,
                  }).addTo(map);
                  linea.bindPopup(
                    `Distancia: ${L.latLng(pos).distanceTo(L.latLng(posBlanco)).toFixed(2)} metros`,
                  );
                  layersRef.current.push(linea);
                }
              }
            }
          }
        } catch (e) {
          // Ignorar errores individuales
        }
      });
    }
  }, [torneo, inscritos, mapReady]);

  if (error) {
    return <div className="alert alert-warning m-3">{error}</div>;
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0 text-white">
          🗺️ Vista Espacial del Torneo
          {torneo?.nombreTorneo && (
            <span className="text-warning"> - {torneo.nombreTorneo}</span>
          )}
        </h5>
      </div>
      <div className="card-body p-0">
        <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
      </div>
      <div className="card-footer bg-light">
        <strong className="d-block mb-2">Leyenda:</strong>
        <div className="d-flex flex-wrap gap-3">
          <div className="d-flex align-items-center gap-1">
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#3b82f6",
                opacity: 0.3,
                border: "2px solid #2563eb",
              }}
            ></div>
            <small>Zona de Competencia</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <img
              src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
              width="15"
              alt=""
            />
            <small>Arquero</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <img
              src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
              width="15"
              alt=""
            />
            <small>Blanco/Diana</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "#8b5cf6",
                borderTop: "1px dashed #8b5cf6",
              }}
            ></div>
            <small>Línea de tiro</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div
              style={{
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                border: "1px solid #ef4444",
                backgroundColor: "rgba(252,165,165,0.3)",
              }}
            ></div>
            <small>Radio seguridad (1.5m)</small>
          </div>
        </div>
      </div>
    </div>
  );
}
