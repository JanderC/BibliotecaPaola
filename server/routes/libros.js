const express = require("express")
const { body } = require("express-validator")

// Debug: Importar todo el controlador primero
const librosController = require("../controllers/librosController")

// Debug: Verificar qué funciones están disponibles
console.log("Funciones disponibles en librosController:", Object.keys(librosController))
console.log("getLibros:", typeof librosController.getLibros)
console.log("getLibroById:", typeof librosController.getLibroById)
console.log("createLibro:", typeof librosController.createLibro)
console.log("updateLibro:", typeof librosController.updateLibro)
console.log("deleteLibro:", typeof librosController.deleteLibro)
console.log("getLibrosForPDF:", typeof librosController.getLibrosForPDF)

// Importar las funciones específicas
const { getLibros, getLibroById, createLibro, updateLibro, deleteLibro, getLibrosForPDF } = librosController
console.log("Funciones importadas correctamente")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
console.log("Paso por el middleware de autenticación")
const router = express.Router()

// Validaciones
const libroValidation = [
  body("titulo").trim().isLength({ min: 1 }).withMessage("Título requerido"),
  body("autor").trim().isLength({ min: 1 }).withMessage("Autor requerido"),
  body("cantidad_total").isInt({ min: 1 }).withMessage("Cantidad total debe ser mayor a 0"),
]

// Rutas públicas
router.get("/", getLibros)
router.get("/pdf", getLibrosForPDF)
router.get("/:id", getLibroById)

// Rutas protegidas (admin)
router.post("/", authenticateToken, requireAdmin, libroValidation, createLibro)
router.put("/:id", authenticateToken, requireAdmin, libroValidation, updateLibro)
router.delete("/:id", authenticateToken, requireAdmin, deleteLibro)

console.log("Rutas públicas configuradas")
module.exports = router