import api from "./api";

const estadisticasService = {
  obtenerCorrelacionAmbiental: async () => {
    const response = await api.get("/estadisticas/correlacion-ambiental");
    return response.data;
  },
};

export default estadisticasService;
