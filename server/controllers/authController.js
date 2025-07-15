const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")
const { pool } = require("../config/database")
const { validationResult } = require("express-validator")

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" })
}

// Registro de usuario
const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { nombre, email, password, telefono, direccion } = req.body

    // Verificar si el email ya existe
    const existingUser = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" })
    }

    // Encriptar contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insertar nuevo usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, direccion) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, nombre, email, rol, fecha_registro`,
      [nombre, email, hashedPassword, telefono, direccion],
    )

    const user = result.rows[0]
    const token = generateToken(user.id)

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        fecha_registro: user.fecha_registro,
      },
      token,
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Login de usuario
const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Buscar usuario
    const result = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1",
      [email],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const user = result.rows[0]

    if (!user.activo) {
      return res.status(401).json({ error: "Cuenta desactivada" })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const token = generateToken(user.id)

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      token,
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Generar token de recuperación (solo admin)
const generateResetToken = async (req, res) => {
  try {
    const { email } = req.body

    // Verificar que el usuario existe
    const userResult = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    // Generar token de recuperación
    const resetToken = uuidv4().substring(0, 8).toUpperCase()
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    await pool.query("UPDATE usuarios SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3", [
      resetToken,
      expiry,
      email,
    ])

    res.json({
      message: "Token de recuperación generado",
      resetToken,
      expiry,
    })
  } catch (error) {
    console.error("Error generando token:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Validar token de recuperación
const validateResetToken = async (req, res) => {
  try {
    const { email, token } = req.body

    const result = await pool.query(
      `SELECT id FROM usuarios 
       WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()`,
      [email, token],
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Token inválido o expirado" })
    }

    res.json({ message: "Token válido" })
  } catch (error) {
    console.error("Error validando token:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Cambiar contraseña con token
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body

    // Verificar token
    const userResult = await pool.query(
      `SELECT id FROM usuarios 
       WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()`,
      [email, token],
    )

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Token inválido o expirado" })
    }

    // Encriptar nueva contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Actualizar contraseña y limpiar token
    await pool.query(
      `UPDATE usuarios 
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL 
       WHERE email = $2`,
      [hashedPassword, email],
    )

    res.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error cambiando contraseña:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

module.exports = {
  register,
  login,
  generateResetToken,
  validateResetToken,
  resetPassword,
}
