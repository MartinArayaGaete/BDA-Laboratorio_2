import api from "./api";

const apiParticipaciones = {
  obtenerTodas: async () => {
    try {
      const response = await api.get("/participaciones");
      return response.data;
    } catch (error) {
      return [];
    }
  },

  obtenerInscritosPorTorneo: async (idTorneo) => {
    try {
      const response = await api.get(`/participaciones/torneo/${idTorneo}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  obtenerDatosCompletosTorneo: async (idTorneo) => {
    const response = await api.get(
      `/participaciones/torneo/${idTorneo}/completo`,
    );
    return response.data;
  },

  // CORREGIDO: Solo envía idUsuario e idTorneo
  inscribirArquero: async (idTorneo, idUsuario) => {
    const response = await api.post("/participaciones/inscribir", {
      idUsuario,
      idTorneo,
    });
    return response.data;
  },

  desinscribirArquero: async (idTorneo, idUsuario) => {
    const response = await api.delete("/participaciones/desinscribir", {
      params: { idTorneo, idUsuario },
    });
    return response.data;
  },

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
