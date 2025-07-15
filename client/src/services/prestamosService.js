// services/prestamosService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export const prestamosService = {
  // Obtener todos los préstamos con paginación y filtros
  getPrestamos: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.estado) queryParams.append('estado', params.estado)
      if (params.usuario_id) queryParams.append('usuario_id', params.usuario_id)
      
      const response = await fetch(`${API_URL}/prestamos?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error obteniendo préstamos')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error en getPrestamos:', error)
      throw error
    }
  },

  // Obtener préstamo por ID
  getPrestamoById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/prestamos/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Préstamo no encontrado')
        }
        throw new Error('Error obteniendo préstamo')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error en getPrestamoById:', error)
      throw error
    }
  },

  // Crear nuevo préstamo
  createPrestamo: async (prestamoData) => {
    try {
      const response = await fetch(`${API_URL}/prestamos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(prestamoData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creando préstamo')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error en createPrestamo:', error)
      throw error
    }
  },

  // Devolver libro (actualizar préstamo)
  devolverLibro: async (id) => {
    try {
      const response = await fetch(`${API_URL}/prestamos/${id}/devolver`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error devolviendo libro')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error en devolverLibro:', error)
      throw error
    }
  },

  // Renovar préstamo
  renovarPrestamo: async (id) => {
    try {
      const response = await fetch(`${API_URL}/prestamos/${id}/renovar`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error renovando préstamo')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error en renovarPrestamo:', error)
      throw error
    }
  },

  // Obtener estadísticas de préstamos
  getEstadisticas: async () => {
    try {
      const response = await fetch(`${API_URL}/prestamos/estadisticas`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error obteniendo estadísticas')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error en getEstadisticas:', error)
      throw error
    }
  }
}