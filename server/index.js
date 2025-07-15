const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const { testConnection } = require("./config/database")

// Importar rutas
const authRoutes = require("./routes/auth")
const librosRoutes = require("./routes/libros")
const prestamosRoutes = require("./routes/prestamos")
const categoriasRoutes = require("./routes/categorias")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware de seguridad
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
})
app.use(limiter)

// CORS
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? ["https://tu-dominio.com"] : ["http://localhost:3000"],
    credentials: true,
  }),
)

// Body parser
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
console.log("Middleware de body parser configurado")
// Rutas
app.use("/api/auth", authRoutes)
console.log("Rutas de autenticación configuradas")
app.use("/api/libros", librosRoutes)
app.use("/api/prestamos", prestamosRoutes)
app.use("/api/categorias", categoriasRoutes)

// Ruta de salud
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
  })
})

// Manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" })
})

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("Error no manejado:", error)
  res.status(500).json({ error: "Error interno del servidor" })
})

// Iniciar servidor
const startServer = async () => {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
      console.log(`📚 Sistema de Biblioteca v${process.env.APP_VERSION || "1.0.0"}`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error)
    process.exit(1)
  }
}

startServer()
