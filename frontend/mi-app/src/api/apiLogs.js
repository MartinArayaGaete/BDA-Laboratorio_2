import api from "./api";

const apiLogs = {
  obtenerAuditoria: async (page = 0, size = 10) => {
    const response = await api.get("/logs", {
      params: { page, size },
    });
    return response.data;
  },
};

export default apiLogs;
