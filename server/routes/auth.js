const express = require("express")
const { body } = require("express-validator")
const {
  register,
  login,
  generateResetToken,
  validateResetToken,
  resetPassword,
} = require("../controllers/authController")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Validaciones
const registerValidation = [
  body("nombre").trim().isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("telefono").optional().isMobilePhone().withMessage("Teléfono inválido"),
]

const loginValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Contraseña requerida"),
]

// Rutas públicas
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)
router.post("/validate-reset-token", validateResetToken)
router.post("/reset-password", resetPassword)

// Rutas protegidas (solo admin)
router.post("/generate-reset-token", authenticateToken, requireAdmin, generateResetToken)

module.exports = router
