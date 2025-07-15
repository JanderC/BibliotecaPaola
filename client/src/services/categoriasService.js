import api from "./api"

export const categoriasService = {
  // Obtener todas las categorías
  getCategorias: async () => {
    const response = await api.get("/categorias")
    return response.data
  },

  // Crear nueva categoría
  createCategoria: async (categoriaData) => {
    const response = await api.post("/categorias", categoriaData)
    return response.data
  },
}
