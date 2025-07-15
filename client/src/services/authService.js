import api from "./api"

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  },

  // Register
  register: async (userData) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  // Generate reset token (admin only)
  generateResetToken: async (email) => {
    const response = await api.post("/auth/generate-reset-token", { email })
    return response.data
  },

  // Validate reset token
  validateResetToken: async (email, token) => {
    const response = await api.post("/auth/validate-reset-token", { email, token })
    return response.data
  },

  // Reset password
  resetPassword: async (email, token, newPassword) => {
    const response = await api.post("/auth/reset-password", { email, token, newPassword })
    return response.data
  },
}
