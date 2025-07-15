const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar que el usuario existe y está activo
    const result = await pool.query(
      "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1 AND activo = true",
      [decoded.userId],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no válido" })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    return res.status(403).json({ error: "Token no válido" })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.rol !== "administrador") {
    return res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador" })
  }
  next()
}

module.exports = { authenticateToken, requireAdmin }
