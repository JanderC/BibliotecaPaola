const { pool } = require("../config/database")
const { validationResult } = require("express-validator")

// Obtener todos los libros
const getLibros = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", categoria = "" } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT l.*, c.nombre as categoria_nombre 
      FROM libros l 
      LEFT JOIN categorias c ON l.categoria_id = c.id 
      WHERE l.activo = true
    `
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      query += ` AND (l.titulo ILIKE $${paramCount} OR l.autor ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (categoria) {
      paramCount++
      query += ` AND l.categoria_id = $${paramCount}`
      params.push(categoria)
    }

    query += ` ORDER BY l.fecha_registro DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Contar total de registros
    let countQuery = "SELECT COUNT(*) FROM libros l WHERE l.activo = true"
    const countParams = []
    let countParamCount = 0

    if (search) {
      countParamCount++
      countQuery += ` AND (l.titulo ILIKE $${countParamCount} OR l.autor ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    if (categoria) {
      countParamCount++
      countQuery += ` AND l.categoria_id = $${countParamCount}`
      countParams.push(categoria)
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = Number.parseInt(countResult.rows[0].count)

    res.json({
      libros: result.rows,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo libros:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Obtener libro por ID
const getLibroById = async (req, res) => {
  try {
    const { id } = req.params
    console.log("Obteniendo libro con ID:", id)
    const result = await pool.query(
      `SELECT l.*, c.nombre as categoria_nombre 
       FROM libros l 
       LEFT JOIN categorias c ON l.categoria_id = c.id 
       WHERE l.id = $1 AND l.activo = true`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Libro no encontrado" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error obteniendo libro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Crear nuevo libro
const createLibro = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
   
    const {
      titulo,
      autor,
      isbn,
      editorial,
      categoria_id,
      año_publicacion,
      numero_paginas,
      cantidad_total,
      ubicacion,
      descripcion,
      imagen_url,
    } = req.body

    const result = await pool.query(
      `INSERT INTO libros (
        titulo, autor, isbn, categoria_id, editorial, año_publicacion,
        numero_paginas, cantidad_total, cantidad_disponible, ubicacion, descripcion, imagen_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11)
      RETURNING *`,
      [
        titulo,
        autor,
        isbn,
        categoria_id,
        editorial,
        año_publicacion,
        numero_paginas,
        cantidad_total,
        ubicacion,
        descripcion,
        imagen_url,
      ],
    )

    res.status(201).json({
      message: "Libro creado exitosamente",
      libro: result.rows[0],
    })
  } catch (error) {
    console.error("Error creando libro:", error)
    if (error.code === "23505") {
      res.status(400).json({ error: "El ISBN ya existe" })
    } else {
      res.status(500).json({ error: "Error interno del servidor" })
    }
  }
}

// Actualizar libro
const updateLibro = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const {
      titulo,
      autor,
      isbn,
      categoria_id,
      editorial,
      año_publicacion,
      numero_paginas,
      cantidad_total,
      ubicacion,
      descripcion,
      imagen_url,
    } = req.body

    const result = await pool.query(
      `UPDATE libros SET 
        titulo = $1, autor = $2, isbn = $3, categoria_id = $4, editorial = $5,
        año_publicacion = $6, numero_paginas = $7, cantidad_total = $8,
        ubicacion = $9, descripcion = $10, imagen_url = $11
      WHERE id = $12 AND activo = true
      RETURNING *`,
      [
        titulo,
        autor,
        isbn,
        categoria_id,
        editorial,
        año_publicacion,
        numero_paginas,
        cantidad_total,
        ubicacion,
        descripcion,
        imagen_url,
        id,
      ],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Libro no encontrado" })
    }

    res.json({
      message: "Libro actualizado exitosamente",
      libro: result.rows[0],
    })
  } catch (error) {
    console.error("Error actualizando libro:", error)
    if (error.code === "23505") {
      res.status(400).json({ error: "El ISBN ya existe" })
    } else {
      res.status(500).json({ error: "Error interno del servidor" })
    }
  }
}

// Eliminar libro (soft delete)
const deleteLibro = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar si hay préstamos activos
    const prestamosActivos = await pool.query("SELECT COUNT(*) FROM prestamos WHERE libro_id = $1 AND estado = $2", [
      id,
      "activo",
    ])

    if (Number.parseInt(prestamosActivos.rows[0].count) > 0) {
      return res.status(400).json({
        error: "No se puede eliminar el libro porque tiene préstamos activos",
      })
    }

    const result = await pool.query("UPDATE libros SET activo = false WHERE id = $1 AND activo = true RETURNING id", [
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Libro no encontrado" })
    }

    res.json({ message: "Libro eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando libro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Nueva función para obtener todos los libros para PDF
const getLibrosForPDF = async (req, res) => {
  try {
    const { search = "", categoria = "" } = req.query;

    let query = `
      SELECT 
        l.titulo,
        l.autor,
        l.isbn,
        l.editorial,
        l.año_publicacion,
        l.cantidad_total,
        l.cantidad_disponible,
        l.ubicacion,
        c.nombre as categoria_nombre 
      FROM libros l 
      LEFT JOIN categorias c ON l.categoria_id = c.id 
      WHERE l.activo = true
    `;
    
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (l.titulo ILIKE $${paramCount} OR l.autor ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (categoria) {
      paramCount++;
      query += ` AND l.categoria_id = $${paramCount}`;
      params.push(categoria);
    }

    query += ` ORDER BY l.titulo ASC`;

    const result = await pool.query(query, params);

    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=catalogo-libros.pdf');

    // Generar PDF (usaremos pdfkit como ejemplo)
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Pipe el PDF directamente a la respuesta
    doc.pipe(res);

    // Agregar contenido al PDF
    doc.fontSize(20).text('Catálogo de Libros', { align: 'center' });
    doc.moveDown();
    
    // Fecha de generación
    doc.fontSize(10).text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Tabla de libros
    doc.fontSize(12);
    result.rows.forEach((libro, index) => {
      doc.text(`${index + 1}. ${libro.titulo} - ${libro.autor}`);
      doc.text(`   ISBN: ${libro.isbn} | Editorial: ${libro.editorial}`);
      doc.text(`   Disponibles: ${libro.cantidad_disponible} de ${libro.cantidad_total}`);
      doc.moveDown();
    });

    // Finalizar el PDF
    doc.end();

  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar el PDF" });
  }
};

module.exports = {
  getLibros,
  getLibroById,
  createLibro,
  updateLibro,
  deleteLibro,
  getLibrosForPDF,
}