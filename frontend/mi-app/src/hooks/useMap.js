import { createContext, useContext } from "react";

export const MapContext = createContext(null);

export function useMap() {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMap debe usarse dentro de <Basemap>");
  }

  return context;
}
