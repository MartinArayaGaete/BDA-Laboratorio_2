import api from "./api";

const categoriaService = {
  obtenerTodas: async () => {
    const response = await api.get("/categorias");
    return response.data;
  },

  obtenerPorId: async (idCategoria) => {
    const response = await api.get(`/categorias/${idCategoria}`);
    return response.data;
  },

  crearCategoria: async (categoria) => {
    const response = await api.post("/categorias", categoria);
    return response.data;
  },

  actualizarCategoria: async (idCategoria, categoria) => {
    const response = await api.put(`/categorias/${idCategoria}`, categoria);
    return response.data;
  },

  eliminarCategoria: async (idCategoria) => {
    const response = await api.delete(`/categorias/${idCategoria}`);
    return response.data;
  },
};

export default categoriaService;
