import api from "./api";

const torneoService = {
  obtenerTodos: async () => {
    const response = await api.get("/torneos");
    return response.data;
  },

  obtenerTorneo: async (idTorneo) => {
    const response = await api.get(`/torneos/${idTorneo}`);
    return response.data;
  },

  crearTorneo: async (datosTorneo) => {
    const response = await api.post("/torneos", datosTorneo);
    return response.data;
  },

  iniciarTorneo: async (idTorneo) => {
    const response = await api.post(`/torneos/${idTorneo}/iniciar`);
    return response.data;
  },

  crearRonda: async (idTorneo, numeroRonda) => {
    const response = await api.post(
      `/torneos/${idTorneo}/rondas/${numeroRonda}`,
    );
    return response.data;
  },

  registrarPuntaje: async (datosPuntaje) => {
    const response = await api.post("/torneos/registrar-puntaje", datosPuntaje);
    return response.data;
  },

  finalizarTorneo: async (idTorneo) => {
    const response = await api.post(`/torneos/${idTorneo}/finalizar`);
    return response.data;
  },

  obtenerPodio: async (idTorneo) => {
    const response = await api.get(`/torneos/${idTorneo}/podio`);
    return response.data;
  },

  obtenerLeaderboardHistorico: async () => {
    const response = await api.get("/torneos/leaderboard");
    return response.data;
  },

  obtenerClimasPorTorneo: async (idTorneo) => {
    const response = await api.get(`/torneos/${idTorneo}/climas`);
    return response.data;
  },

  obtenerPosicionesRonda: async (idTorneo, numeroRonda) => {
    const response = await api.get(
      `/torneos/${idTorneo}/rondas/${numeroRonda}/posiciones`,
    );
    return response.data;
  },

  obtenerPosicionArqueroEnRonda: async (idTorneo, numeroRonda, idUsuario) => {
    const response = await api.get(
      `/torneos/${idTorneo}/rondas/${numeroRonda}/arqueros/${idUsuario}/posicion`,
    );
    return response.data;
  },

  eliminarTorneo: async (idTorneo) => {
    const response = await api.delete(`/torneos/${idTorneo}`);
    return response.data;
  },

  actualizarTorneo: async (idTorneo, datos) => {
    const response = await api.put(`/torneos/${idTorneo}`, datos);
    return response.data;
  },
};

export default torneoService;
