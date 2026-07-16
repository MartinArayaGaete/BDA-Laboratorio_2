import api from "./api";

const usuarioService = {
  obtenerTodos: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },

  obtenerPorRut: async (rut) => {
    const response = await api.get(`/usuarios/${rut}`);
    return response.data;
  },

  crearUsuario: async (nuevoUsuario) => {
    const response = await api.post("/usuarios", nuevoUsuario);
    return response.data;
  },

  actualizarUsuario: async (rut, datosUsuario) => {
    const response = await api.put(`/usuarios/${rut}`, datosUsuario);
    return response.data;
  },

  eliminarUsuario: async (rut) => {
    const response = await api.delete(`/usuarios/${rut}`);
    return response.data;
  },
};

export default usuarioService;
