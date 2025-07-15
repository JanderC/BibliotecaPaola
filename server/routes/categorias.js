const express = require("express")
const { pool } = require("../config/database")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias ORDER BY nombre ASC")
    res.json(result.rows)
  } catch (error) {
    console.error("Error obteniendo categorías:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear categoría (solo admin)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body

    const result = await pool.query("INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *", [
      nombre,
      descripcion,
    ])

    res.status(201).json({
      message: "Categoría creada exitosamente",
      categoria: result.rows[0],
    })
  } catch (error) {
    console.error("Error creando categoría:", error)
    if (error.code === "23505") {
      res.status(400).json({ error: "La categoría ya existe" })
    } else {
      res.status(500).json({ error: "Error interno del servidor" })
    }
  }
})

module.exports = router
