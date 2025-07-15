const { pool } = require("../config/database")
const { validationResult } = require("express-validator")
const PDFDocument = require("pdfkit")

// Obtener préstamos
const getPrestamos = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado = "", usuario_id = "" } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email,
             l.titulo as libro_titulo, l.autor as libro_autor
      FROM prestamos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN libros l ON p.libro_id = l.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (estado) {
      paramCount++
      query += ` AND p.estado = $${paramCount}`
      params.push(estado)
    }

    if (usuario_id) {
      paramCount++
      query += ` AND p.usuario_id = $${paramCount}`
      params.push(usuario_id)
    }

    query += ` ORDER BY p.fecha_prestamo DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Contar total
    let countQuery = "SELECT COUNT(*) FROM prestamos p WHERE 1=1"
    const countParams = []
    let countParamCount = 0

    if (estado) {
      countParamCount++
      countQuery += ` AND p.estado = $${countParamCount}`
      countParams.push(estado)
    }

    if (usuario_id) {
      countParamCount++
      countQuery += ` AND p.usuario_id = $${countParamCount}`
      countParams.push(usuario_id)
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = Number.parseInt(countResult.rows[0].count)

    res.json({
      prestamos: result.rows,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo préstamos:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear nuevo préstamo
const createPrestamo = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await client.query("ROLLBACK")
      return res.status(400).json({ errors: errors.array() })
    }

    const { usuario_id, libro_id, dias_prestamo = 15 } = req.body

    // Verificar disponibilidad del libro
    const libroResult = await client.query("SELECT cantidad_disponible FROM libros WHERE id = $1 AND activo = true", [
      libro_id,
    ])

    if (libroResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Libro no encontrado" })
    }

    if (libroResult.rows[0].cantidad_disponible <= 0) {
      await client.query("ROLLBACK")
      return res.status(400).json({ error: "Libro no disponible" })
    }

    // Verificar límite de libros por usuario
    const prestamosActivos = await client.query(
      "SELECT COUNT(*) FROM prestamos WHERE usuario_id = $1 AND estado = $2",
      [usuario_id, "activo"],
    )

    const maxLibros = await client.query("SELECT valor FROM configuracion WHERE clave = $1", ["max_libros_usuario"])

    const limite = Number.parseInt(maxLibros.rows[0]?.valor || 3)

    if (Number.parseInt(prestamosActivos.rows[0].count) >= limite) {
      await client.query("ROLLBACK")
      return res.status(400).json({
        error: `El usuario ya tiene el máximo de libros permitidos (${limite})`,
      })
    }

    // Calcular fecha de devolución
    const fechaDevolucion = new Date()
    fechaDevolucion.setDate(fechaDevolucion.getDate() + dias_prestamo)

    // Crear préstamo
    const prestamoResult = await client.query(
      `INSERT INTO prestamos (usuario_id, libro_id, fecha_devolucion_esperada)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuario_id, libro_id, fechaDevolucion.toISOString().split("T")[0]],
    )

    await client.query("COMMIT")

    res.status(201).json({
      message: "Préstamo creado exitosamente",
      prestamo: prestamoResult.rows[0],
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error creando préstamo:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  } finally {
    client.release()
  }
}

// Devolver libro
const devolverLibro = async (req, res) => {
  try {
    const { id } = req.params
    const { observaciones = "" } = req.body

    const result = await pool.query(
      `UPDATE prestamos 
       SET estado = 'devuelto', fecha_devolucion_real = NOW(), observaciones = $1
       WHERE id = $2 AND estado = 'activo'
       RETURNING *`,
      [observaciones, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Préstamo no encontrado o ya devuelto" })
    }

    res.json({
      message: "Libro devuelto exitosamente",
      prestamo: result.rows[0],
    })
  } catch (error) {
    console.error("Error devolviendo libro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Generar reporte PDF
const generarReportePDF = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado = "" } = req.query

    let query = `
      SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email,
             l.titulo as libro_titulo, l.autor as libro_autor
      FROM prestamos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN libros l ON p.libro_id = l.id
      WHERE p.fecha_prestamo >= $1 AND p.fecha_prestamo <= $2
    `
    const params = [fecha_inicio, fecha_fin]

    if (estado) {
      query += " AND p.estado = $3"
      params.push(estado)
    }

    query += " ORDER BY p.fecha_prestamo DESC"

    const result = await pool.query(query, params)

    // Crear PDF
    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=reporte-prestamos.pdf")

    doc.pipe(res)

    // Título
    doc.fontSize(20).text("Reporte de Préstamos", { align: "center" })
    doc.moveDown()

    // Información del reporte
    doc.fontSize(12)
    doc.text(`Período: ${fecha_inicio} - ${fecha_fin}`)
    doc.text(`Total de registros: ${result.rows.length}`)
    doc.moveDown()

    // Tabla de datos
    result.rows.forEach((prestamo, index) => {
      if (index > 0 && index % 10 === 0) {
        doc.addPage()
      }

      doc.text(`${index + 1}. ${prestamo.usuario_nombre}`, { continued: true })
      doc.text(` - ${prestamo.libro_titulo}`)
      doc.text(`   Autor: ${prestamo.libro_autor}`)
      doc.text(`   Fecha préstamo: ${new Date(prestamo.fecha_prestamo).toLocaleDateString()}`)
      doc.text(`   Estado: ${prestamo.estado}`)
      doc.moveDown(0.5)
    })

    doc.end()
  } catch (error) {
    console.error("Error generando reporte:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

module.exports = {
  getPrestamos,
  createPrestamo,
  devolverLibro,
  generarReportePDF,
}
