const express = require("express")
const router = express.Router()
const { pool } = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (token == null) return res.sendStatus(401) // Si no hay token, devuelve 401

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) // Si el token no es válido, devuelve 403
    req.user = user
    next() // Continúa con la siguiente función middleware o ruta
  })
}

// Ruta para registrar un nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono } = req.body

    // Verificar si el correo electrónico ya está en uso
    const emailCheck = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email])
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertar el nuevo usuario en la base de datos
    const newUser = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, email, hashedPassword, rol, telefono],
    )

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.rows[0].id,
        nombre: newUser.rows[0].nombre,
        email: newUser.rows[0].email,
        rol: newUser.rows[0].rol,
        telefono: newUser.rows[0].telefono,
      },
    })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Verificar si el usuario existe
    const user = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email])
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" })
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].password)
    if (!validPassword) {
      return res.status(400).json({ error: "Credenciales inválidas" })
    }

    // Crear y asignar un token JWT
    const token = jwt.sign({ id: user.rows[0].id, rol: user.rows[0].rol }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Puedes ajustar el tiempo de expiración
    })

    res.json({
      message: "Inicio de sesión exitoso",
      token: token,
      user: {
        id: user.rows[0].id,
        nombre: user.rows[0].nombre,
        email: user.rows[0].email,
        rol: user.rows[0].rol,
        telefono: user.rows[0].telefono,
      },
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Agregar estas rutas al final del archivo antes del module.exports

// Obtener todos los usuarios (para préstamos)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT id, nombre, email, rol, telefono, fecha_registro, activo 
      FROM usuarios 
      WHERE activo = true
    `
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      query += ` AND (nombre ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY nombre ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Contar total
    let countQuery = "SELECT COUNT(*) FROM usuarios WHERE activo = true"
    const countParams = []
    let countParamCount = 0

    if (search) {
      countParamCount++
      countQuery += ` AND (nombre ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = Number.parseInt(countResult.rows[0].count)

    res.json({
      usuarios: result.rows,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

module.exports = router
