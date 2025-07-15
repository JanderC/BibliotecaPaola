"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Alert,
  Spinner,
  Modal,
  Form,
  InputGroup,
  Pagination,
  Badge
} from "react-bootstrap"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFilePdf } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"
import { librosService } from "../../services/librosService"

const Libros = () => {
  const { user, isAdmin } = useAuth()
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLibros, setFilteredLibros] = useState([])

  // Estados para modal
  const [showModal, setShowModal] = useState(false)
  const [editingLibro, setEditingLibro] = useState(null)
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    categoria_id: "",
    editorial: "",
    año_publicacion: "",
    numero_paginas: "",
    cantidad_total: "",
    ubicacion: "",
    descripcion: "",
    imagen_url: ""
  })

  // Estados para modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingLibro, setDeletingLibro] = useState(null)

  useEffect(() => {
    loadLibros()
  }, [currentPage])

  useEffect(() => {
    filterLibros()
  }, [libros, searchTerm])

  const loadLibros = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await librosService.getLibros({
        page: currentPage,
        limit: 10
      })

      setLibros(response.libros || [])
      setTotalPages(response.pagination?.pages || 1)

    } catch (error) {
      console.error("Error cargando libros:", error)
      setError("Error cargando los libros")
    } finally {
      setLoading(false)
    }
  }

  const filterLibros = () => {
    if (!searchTerm) {
      setFilteredLibros(libros)
      return
    }

    const filtered = libros.filter(libro =>
      libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredLibros(filtered)
  }

  // Función para generar y descargar PDF
  const generatePDF = async () => {
  try {
    setLoadingPDF(true);
    setError("");
    
    // Obtener el blob del PDF directamente
    const pdfBlob = await librosService.getLibrosForPDF({
      search: searchTerm
    });
    
    // Crear URL para el blob y descargar
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalogo-libros-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setSuccess("PDF descargado exitosamente");
    
  } catch (error) {
    console.error("Error generando PDF:", error);
    setError(error.message || "Error al generar el PDF");
  } finally {
    setLoadingPDF(false);
  }
};

  const handleShowModal = (libro = null) => {
    if (libro) {
      setEditingLibro(libro)
      setFormData({
        titulo: libro.titulo || "",
        autor: libro.autor || "",
        isbn: libro.isbn || "",
        categoria_id: libro.categoria_id || "",
        editorial: libro.editorial || "",
        año_publicacion: libro.año_publicacion || "",
        numero_paginas: libro.numero_paginas || "",
        cantidad_total: libro.cantidad_total || "",
        ubicacion: libro.ubicacion || "",
        descripcion: libro.descripcion || "",
        imagen_url: libro.imagen_url || ""
      })
    } else {
      setEditingLibro(null)
      setFormData({
        titulo: "",
        autor: "",
        isbn: "",
        categoria_id: "fa2fe931-cd34-4bba-b736-47b88c02ac1b",
        editorial: "",
        año_publicacion: "",
        numero_paginas: "",
        cantidad_total: "",
        ubicacion: "",
        descripcion: "",
        imagen_url: ""
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLibro(null)
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      if (editingLibro) {
        await librosService.updateLibro(editingLibro.id, formData)
        setSuccess("Libro actualizado exitosamente")
      } else {
        await librosService.createLibro(formData)
        setSuccess("Libro creado exitosamente")
      }

      handleCloseModal()
      loadLibros()

    } catch (error) {
      console.error("Error guardando libro:", error)
      setError(error.message || "Error guardando el libro")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLibro) return

    try {
      setLoading(true)
      setError("")

      await librosService.deleteLibro(deletingLibro.id)
      setSuccess("Libro eliminado exitosamente")

      setShowDeleteModal(false)
      setDeletingLibro(null)
      loadLibros()

    } catch (error) {
      console.error("Error eliminando libro:", error)
      setError(error.message || "Error eliminando el libro")
    } finally {
      setLoading(false)
    }
  }

  const handleShowDeleteModal = (libro) => {
    setDeletingLibro(libro)
    setShowDeleteModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Verificar si el usuario es administrador
  if (!isAdmin()) {
    return (
      <Container>
        <Alert variant="danger">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta sección. Se requieren permisos de administrador.</p>
        </Alert>
      </Container>
    )
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Gestión de Libros</h1>
          <p className="text-muted">Administra el catálogo de libros de la biblioteca</p>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-danger"
            className="me-2"
            onClick={generatePDF}
            disabled={loadingPDF}
          >
            {loadingPDF ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generando PDF...
              </>
            ) : (
              <>
                <FaFilePdf className="me-2" />
                Descargar PDF
              </>
            )}
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <FaPlus className="me-2" />
            Nuevo Libro
          </Button>
        </Col>
      </Row>

      {/* Alertas */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Buscador */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <small className="text-muted">
            {searchTerm && `Filtrado por: "${searchTerm}" - `}
            Mostrando {filteredLibros.length} de {libros.length} libros
          </small>
        </Col>
      </Row>

      {/* Tabla de libros */}
      <Row>
        <Col>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando libros...</p>
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>ISBN</th>
                    <th>Editorial</th>
                    <th>Disponibles</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLibros.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchTerm ? "No se encontraron libros que coincidan con la búsqueda" : "No hay libros registrados"}
                      </td>
                    </tr>
                  ) : (
                    filteredLibros.map((libro) => (
                      <tr key={libro.id}>
                        <td>
                          <strong>{libro.titulo}</strong>
                          {libro.categoria_nombre && (
                            <div>
                              <Badge bg="secondary" className="mt-1">
                                {libro.categoria_nombre}
                              </Badge>
                            </div>
                          )}
                        </td>
                        <td>{libro.autor}</td>
                        <td>{libro.isbn}</td>
                        <td>{libro.editorial}</td>
                        <td>
                          <Badge bg={libro.cantidad_disponible > 0 ? "success" : "danger"}>
                            {libro.cantidad_disponible}
                          </Badge>
                        </td>
                        <td>{libro.cantidad_total}</td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-2"
                            title="Ver detalles"
                            onClick={() => handleShowModal(libro)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            title="Editar"
                            onClick={() => handleShowModal(libro)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Eliminar"
                            onClick={() => handleShowDeleteModal(libro)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <Row className="mt-3">
                  <Col className="d-flex justify-content-center">
                    <Pagination>
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      />

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}

                      <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Modal para crear/editar libro */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingLibro ? "Editar Libro" : "Nuevo Libro"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Autor *</Form.Label>
                  <Form.Control
                    type="text"
                    name="autor"
                    value={formData.autor}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Editorial</Form.Label>
                  <Form.Control
                    type="text"
                    name="editorial"
                    value={formData.editorial}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Año de Publicación</Form.Label>
                  <Form.Control
                    type="number"
                    name="año_publicacion"
                    value={formData.año_publicacion}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Páginas</Form.Label>
                  <Form.Control
                    type="number"
                    name="numero_paginas"
                    value={formData.numero_paginas}
                    onChange={handleInputChange}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad Total *</Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad_total"
                    value={formData.cantidad_total}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    placeholder="Ej: Estante A, Nivel 2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL de Imagen</Form.Label>
                  <Form.Control
                    type="url"
                    name="imagen_url"
                    value={formData.imagen_url}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                editingLibro ? "Actualizar" : "Crear"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el libro "<strong>{deletingLibro?.titulo}</strong>"?
          <br />
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Libros