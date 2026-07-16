import api from "./api.js";

const authService = {
  login: async (rut, password) => {
    const response = await api.post("/auth/login", { rut, password });
    return response.data;
  },

  logout: async () => {
    return await api.post("/auth/logout");
  },
};

export default authService;
