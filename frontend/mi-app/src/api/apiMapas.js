import api from "./api";

const apiMapas = {
  /**
   * Obtiene el polígono de la zona de competencia y la línea de tiro
   * de un torneo específico en formato GeoJSON.
   */
  obtenerMapaTorneo: async (idTorneo) => {
    try {
      const response = await api.get(`/mapas/torneos/${idTorneo}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el mapa del torneo ${idTorneo}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todos los polígonos de las zonas climáticas/ambientales
   * activas en formato GeoJSON.
   */
  obtenerZonasAmbientales: async () => {
    try {
      const response = await api.get("/mapas/zonas-ambientales");
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener las zonas ambientales:", error);
      return [];
    }
  },
};

export default apiMapas;
