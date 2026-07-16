// src/api/apiParticipaciones.js
import api from "./api";

const apiParticipaciones = {
  // Obtener todas las participaciones
  obtenerTodas: async () => {
    try {
      const response = await api.get("/participaciones");
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Obtener inscritos por torneo
  obtenerInscritosPorTorneo: async (idTorneo) => {
    try {
      const response = await api.get(`/participaciones/torneo/${idTorneo}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  // Obtener datos completos del torneo (zona + arqueros + posiciones + blancos)
  obtenerDatosCompletosTorneo: async (idTorneo) => {
    const response = await api.get(
      `/participaciones/torneo/${idTorneo}/completo`,
    );
    return response.data;
  },

  // Inscribir arquero en torneo
  inscribirArquero: async (
    idTorneo,
    idUsuario,
    ubicacionArquero,
    ubicacionBlanco,
  ) => {
    const response = await api.post("/participaciones/inscribir", {
      idTorneo,
      idUsuario,
      ubicacionArquero,
      ubicacionBlanco,
    });
    return response.data;
  },

  // Desinscribir arquero de torneo
  desinscribirArquero: async (idTorneo, idUsuario) => {
    const response = await api.delete("/participaciones/desinscribir", {
      params: { idTorneo, idUsuario },
    });
    return response.data;
  },

  // Obtener torneos inscritos de un usuario
  obtenerTorneosInscritos: async (idUsuario) => {
    try {
      const response = await api.get(`/participaciones/usuario/${idUsuario}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
};

export default apiParticipaciones;
