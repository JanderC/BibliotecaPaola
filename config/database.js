const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false, // Sin SSL como solicitado
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log("✅ Conexión a PostgreSQL establecida correctamente")
    client.release()
  } catch (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.message)
    process.exit(1)
  }
}

module.exports = { pool, testConnection }
