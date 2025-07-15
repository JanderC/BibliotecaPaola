import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Table, 
  Badge, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Pagination,
  InputGroup,
  Card
} from "react-bootstrap"
import { 
  FaPlus, 
  FaCheck, 
  FaEye, 

  FaSearch,
  FaRedo,
  FaBook,
  FaUser
} from "react-icons/fa"
import { prestamosService } from '../../services/prestamosService'
import { usuariosService } from '../../services/usuariosService'
import { librosService } from '../../services/librosService'

const Prestamos = () => {
  // Estados principales
  const [prestamos, setPrestamos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [libros, setLibros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPrestamo, setSelectedPrestamo] = useState(null)

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Estado para el formulario
  const [formData, setFormData] = useState({
    usuario_id: '',
    libro_id: '',
    dias_prestamo: 15,
    observaciones: ''
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadPrestamos()
    loadUsuarios()
    loadLibros()
  }, [currentPage, filtroEstado, filtroUsuario])

  const loadPrestamos = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        estado: filtroEstado,
        usuario_id: filtroUsuario
      }
      
      const response = await prestamosService.getPrestamos(params)
      setPrestamos(response.prestamos)
      setTotalPages(response.pagination.pages)
      setTotalRecords(response.pagination.total)
    } catch (err) {
      setError('Error cargando préstamos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsuarios = async () => {
    try {
      const response = await usuariosService.getUsuarios({ limit: 100 })
      setUsuarios(response.usuarios || [])
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    }
  }

  const loadLibros = async () => {
    try {
      const response = await librosService.getLibros({ limit: 100 })
      setLibros(response.libros || [])
    } catch (err) {
      console.error('Error cargando libros:', err)
    }
  }

  // Crear nuevo préstamo
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await prestamosService.createPrestamo(formData)
      setSuccess('Préstamo creado exitosamente')
      setShowCreateModal(false)
      resetForm()
      loadPrestamos()
    } catch (err) {
      setError('Error creando préstamo: ' + err.message)
    }
  }

  // Devolver libro
  const handleDevolver = async (id) => {
    try {
      await prestamosService.devolverLibro(id)
      setSuccess('Libro devuelto exitosamente')
      loadPrestamos()
    } catch (err) {
      setError('Error devolviendo libro: ' + err.message)
    }
  }

  // Renovar préstamo
  const handleRenovar = async (id) => {
    try {
      await prestamosService.renovarPrestamo(id)
      setSuccess('Préstamo renovado exitosamente')
      loadPrestamos()
    } catch (err) {
      setError('Error renovando préstamo: ' + err.message)
    }
  }

  // Ver detalles
  const handleView = async (id) => {
    try {
      const prestamo = await prestamosService.getPrestamoById(id)
      setSelectedPrestamo(prestamo)
      setShowViewModal(true)
    } catch (err) {
      setError('Error cargando detalles: ' + err.message)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      usuario_id: '',
      libro_id: '',
      dias_prestamo: 15,
      observaciones: ''
    })
  }

  // Limpiar alertas
  const clearAlerts = () => {
    setError('')
    setSuccess('')
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Obtener badge del estado
  const getEstadoBadge = (estado) => {
    const badges = {
      'activo': 'success',
      'devuelto': 'secondary',
      'vencido': 'danger',
      'renovado': 'warning'
    }
    return <Badge bg={badges[estado] || 'secondary'}>{estado.toUpperCase()}</Badge>
  }

  // Filtrar préstamos por búsqueda
  const prestamosFiltrados = prestamos.filter(prestamo => {
    if (!busqueda) return true
    return (
      prestamo.usuario_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prestamo.libro_titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      prestamo.libro_autor.toLowerCase().includes(busqueda.toLowerCase())
    )
  })

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1><FaBook className="me-2" />Gestión de Préstamos</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="me-2"
          >
            <FaPlus className="me-2" />
            Nuevo Préstamo
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={loadPrestamos}
          >
            <FaRedo className="me-2" />
            Actualizar
          </Button>
        </Col>
      </Row>

      {/* Alertas */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearAlerts}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={clearAlerts}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filtrar por Estado</Form.Label>
                <Form.Select 
                  value={filtroEstado} 
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="devuelto">Devueltos</option>
                  <option value="vencido">Vencidos</option>
                  <option value="renovado">Renovados</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filtrar por Usuario</Form.Label>
                <Form.Select 
                  value={filtroUsuario} 
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                >
                  <option value="">Todos</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Búsqueda</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por usuario, libro o autor..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de préstamos */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Libro</th>
                    <th>Autor</th>
                    <th>Fecha Préstamo</th>
                    <th>Fecha Devolución</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No hay préstamos disponibles
                      </td>
                    </tr>
                  ) : (
                    prestamosFiltrados.map(prestamo => (
                      <tr key={prestamo.id}>
                        <td>
                          <div>
                            <strong>{prestamo.usuario_nombre}</strong>
                            <br />
                            <small className="text-muted">{prestamo.usuario_email}</small>
                          </div>
                        </td>
                        <td>{prestamo.libro_titulo}</td>
                        <td>{prestamo.libro_autor}</td>
                        <td>{formatDate(prestamo.fecha_prestamo)}</td>
                        <td>{formatDate(prestamo.fecha_devolucion_esperada)}</td>
                        <td>{getEstadoBadge(prestamo.estado)}</td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleView(prestamo.id)}
                          >
                            <FaEye />
                          </Button>
                          {prestamo.estado === 'activo' && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="me-1"
                                onClick={() => handleDevolver(prestamo.id)}
                              >
                                <FaCheck />
                              </Button>
                              <Button 
                                variant="outline-warning" 
                                size="sm"
                                onClick={() => handleRenovar(prestamo.id)}
                              >
                                <FaRedo />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Paginación */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <small className="text-muted">
                    Mostrando {prestamosFiltrados.length} de {totalRecords} registros
                  </small>
                </div>
                <Pagination>
                  <Pagination.First 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
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
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal Crear Préstamo */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Crear Nuevo Préstamo
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario *</Form.Label>
                  <Form.Select 
                    value={formData.usuario_id}
                    onChange={(e) => setFormData({...formData, usuario_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} - {usuario.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Libro *</Form.Label>
                  <Form.Select 
                    value={formData.libro_id}
                    onChange={(e) => setFormData({...formData, libro_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar libro</option>
                    {libros.map(libro => (
                      <option key={libro.id} value={libro.id}>
                        {libro.titulo} - {libro.autor}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Días de Préstamo</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="30"
                    value={formData.dias_prestamo}
                    onChange={(e) => setFormData({...formData, dias_prestamo: parseInt(e.target.value)})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Observaciones adicionales..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Crear Préstamo
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Ver Detalles */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            Detalles del Préstamo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrestamo && (
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <FaUser className="me-2" />
                    Información del Usuario
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Nombre:</strong> {selectedPrestamo.usuario_nombre}</p>
                    <p><strong>Email:</strong> {selectedPrestamo.usuario_email}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <FaBook className="me-2" />
                    Información del Libro
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Título:</strong> {selectedPrestamo.libro_titulo}</p>
                    <p><strong>Autor:</strong> {selectedPrestamo.libro_autor}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                <Card>
                  <Card.Header>Detalles del Préstamo</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <p><strong>Estado:</strong> {getEstadoBadge(selectedPrestamo.estado)}</p>
                      </Col>
                      <Col md={4}>
                        <p><strong>Fecha Préstamo:</strong> {formatDate(selectedPrestamo.fecha_prestamo)}</p>
                      </Col>
                      <Col md={4}>
                        <p><strong>Fecha Devolución:</strong> {formatDate(selectedPrestamo.fecha_devolucion_esperada)}</p>
                      </Col>
                    </Row>
                    {selectedPrestamo.fecha_devolucion_real && (
                      <p><strong>Fecha Devolución Real:</strong> {formatDate(selectedPrestamo.fecha_devolucion_real)}</p>
                    )}
                    {selectedPrestamo.observaciones && (
                      <p><strong>Observaciones:</strong> {selectedPrestamo.observaciones}</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Prestamos