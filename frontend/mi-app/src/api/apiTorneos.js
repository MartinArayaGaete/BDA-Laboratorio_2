import api from "./api";

const torneoService = {
  // Obtener todos los torneos
  obtenerTodos: async () => {
    const response = await api.get("/torneos");
    return response.data;
  },

  obtenerTorneo: async (idTorneo) => {
    const response = await api.get(`/torneos/${idTorneo}`);
    return response.data;
  },

  // Crear un nuevo torneo
  crearTorneo: async (datosTorneo) => {
    const response = await api.post("/torneos", datosTorneo);
    return response.data;
  },

  // Iniciar el torneo
  iniciarTorneo: async (idTorneo) => {
    const response = await api.post(`/torneos/${idTorneo}/iniciar`);
    return response.data;
  },

  // agregar ronda
  crearRonda: async (idTorneo, numeroRonda) => {
    const response = await api.post(
      `/torneos/${idTorneo}/rondas/${numeroRonda}`,
    );
    return response.data;
  },

  // Registrar ronda completa
  registrarPuntajes: async (idTorneo, idUsuario, numeroRonda, flechas) => {
    const response = await api.post(
      `/torneos/${idTorneo}/arqueros/${idUsuario}/rondas/${numeroRonda}/flechas`,
      { flechas },
    );
    return response.data;
  },

  // Finalizar torneo y calcular ranking
  finalizarTorneo: async (idTorneo) => {
    const response = await api.post(`/torneos/${idTorneo}/finalizar`);
    return response.data;
  },

  // Obtener el podio
  obtenerPodio: async (idTorneo) => {
    const response = await api.get(`/torneos/${idTorneo}/podio`);
    return response.data;
  },

  // leaderboard
  obtenerLeaderboardHistorico: async () => {
    const response = await api.get("/torneos/leaderboard");
    return response.data;
  },
};

export default torneoService;
