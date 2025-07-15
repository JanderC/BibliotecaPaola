const express = require("express")
const { body } = require("express-validator")
const { getPrestamos, createPrestamo, devolverLibro, generarReportePDF } = require("../controllers/prestamosController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Validaciones
const prestamoValidation = [
  body("usuario_id").isUUID().withMessage("ID de usuario inválido"),
  body("libro_id").isUUID().withMessage("ID de libro inválido"),
]

// Rutas protegidas
router.get("/", authenticateToken, getPrestamos)
router.post("/", authenticateToken, requireAdmin, prestamoValidation, createPrestamo)
router.put("/:id/devolver", authenticateToken, requireAdmin, devolverLibro)
router.get("/reporte/pdf", authenticateToken, requireAdmin, generarReportePDF)

module.exports = router
