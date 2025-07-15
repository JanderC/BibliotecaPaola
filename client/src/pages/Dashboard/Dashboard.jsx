"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap"
import { FaBook, FaUsers, FaChartBar, FaExclamationTriangle } from "react-icons/fa"
import { librosService } from "../../services/librosService"
import { prestamosService } from "../../services/prestamosService"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLibros: 0,
    librosDisponibles: 0,
    prestamosActivos: 0,
    prestamosVencidos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Obtener estadísticas de libros
      const librosResponse = await librosService.getLibros({ limit: 1000 })
      const libros = librosResponse.libros || []

      // Obtener estadísticas de préstamos
      const prestamosResponse = await prestamosService.getPrestamos({ limit: 1000 })
      const prestamos = prestamosResponse.prestamos || []

      // Calcular estadísticas
      const totalLibros = libros.length
      const librosDisponibles = libros.reduce((sum, libro) => sum + (libro.cantidad_disponible || 0), 0)
      const prestamosActivos = prestamos.filter((p) => p.estado === "activo").length

      // Calcular préstamos vencidos
      const today = new Date()
      const prestamosVencidos = prestamos.filter((p) => {
        if (p.estado !== "activo") return false
        const fechaDevolucion = new Date(p.fecha_devolucion_esperada)
        return fechaDevolucion < today
      }).length

      setStats({
        totalLibros,
        librosDisponibles,
        prestamosActivos,
        prestamosVencidos,
      })
    } catch (error) {
      console.error("Error cargando dashboard:", error)
      setError("Error cargando las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">Bienvenido al sistema de biblioteca</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-white mb-3">
            <Card.Body className="text-center">
              <FaBook size={48} className="mb-3" />
              <h2>{stats.totalLibros}</h2>
              <Card.Title>Total Libros</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card success text-white mb-3">
            <Card.Body className="text-center">
              <FaBook size={48} className="mb-3" />
              <h2>{stats.librosDisponibles}</h2>
              <Card.Title>Disponibles</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card info text-white mb-3">
            <Card.Body className="text-center">
              <FaUsers size={48} className="mb-3" />
              <h2>{stats.prestamosActivos}</h2>
              <Card.Title>Préstamos Activos</Card.Title>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card warning text-white mb-3">
            <Card.Body className="text-center">
              <FaExclamationTriangle size={48} className="mb-3" />
              <h2>{stats.prestamosVencidos}</h2>
              <Card.Title>Vencidos</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Resumen del Sistema</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>Libros en catálogo:</strong> {stats.totalLibros}
                </li>
                <li className="mb-2">
                  <strong>Ejemplares disponibles:</strong> {stats.librosDisponibles}
                </li>
                <li className="mb-2">
                  <strong>Préstamos activos:</strong> {stats.prestamosActivos}
                </li>
                <li className="mb-2">
                  <strong>Préstamos vencidos:</strong>
                  <span className={`ms-2 ${stats.prestamosVencidos > 0 ? "text-danger" : "text-success"}`}>
                    {stats.prestamosVencidos}
                  </span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Acciones Rápidas</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <a href="/libros" className="btn btn-primary">
                  <FaBook className="me-2" />
                  Gestionar Libros
                </a>
                <a href="/prestamos" className="btn btn-success">
                  <FaUsers className="me-2" />
                  Nuevo Préstamo
                </a>
                <a href="/prestamos" className="btn btn-info">
                  <FaChartBar className="me-2" />
                  Ver Reportes
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
