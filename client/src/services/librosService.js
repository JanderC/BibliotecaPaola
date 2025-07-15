// services/librosService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export const librosService = {
  // Obtener todos los libros con paginación y filtros
  getLibros: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      if (params.categoria) queryParams.append('categoria', params.categoria)

      const response = await fetch(`${API_URL}/libros?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Error obteniendo libros')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en getLibros:', error)
      throw error
    }
  },

  // Obtener libro por ID
  getLibroById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/libros/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Libro no encontrado')
        }
        throw new Error('Error obteniendo libro')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en getLibroById:', error)
      throw error
    }
  },

  // Crear nuevo libro
  createLibro: async (libroData) => {
    try {
      const response = await fetch(`${API_URL}/libros`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(libroData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creando libro')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en createLibro:', error)
      throw error
    }
  },

  // Actualizar libro
  updateLibro: async (id, libroData) => {
    try {
      const response = await fetch(`${API_URL}/libros/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(libroData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error actualizando libro')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en updateLibro:', error)
      throw error
    }
  },

  // Eliminar libro
  deleteLibro: async (id) => {
    try {
      const response = await fetch(`${API_URL}/libros/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error eliminando libro')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en deleteLibro:', error)
      throw error
    }
  },

  // Obtener todos los libros para PDF
  getLibrosForPDF: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.search) queryParams.append('search', params.search);
      if (params.categoria) queryParams.append('categoria', params.categoria);

      const response = await fetch(`${API_URL}/libros/pdf?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error obteniendo PDF');
      }

      // Obtener el blob del PDF directamente
      const blob = await response.blob();
      return blob;

    } catch (error) {
      console.error('Error en getLibrosForPDF:', error);
      throw error;
    }
  }
}