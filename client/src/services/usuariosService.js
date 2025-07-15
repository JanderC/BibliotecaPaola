import api from "./api"

export const usuariosService = {
  // Obtener todos los usuarios (admin only)
  getUsuarios: async (params = {}) => {
    const response = await api.get("/usuarios", { params })
    return response.data
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  // Actualizar usuario
  updateUsuario: async (id, userData) => {
    const response = await api.put(`/usuarios/${id}`, userData)
    return response.data
  },

  // Desactivar usuario
  deactivateUsuario: async (id) => {
    const response = await api.put(`/usuarios/${id}/deactivate`)
    return response.data
  },
}
