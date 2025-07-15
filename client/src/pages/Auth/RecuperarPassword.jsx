"use client"

import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaBook, FaEnvelope, FaKey, FaLock, FaArrowLeft } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"

const RecuperarPassword = () => {
  const [step, setStep] = useState(1) // 1: email, 2: token, 3: nueva contraseña
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { validateResetToken, resetPassword } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
    setSuccess("")
  }

  const handleValidateToken = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await validateResetToken(formData.email, formData.token)

    if (result.success) {
      setStep(3)
      setSuccess("Token válido. Ahora puedes cambiar tu contraseña.")
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    const result = await resetPassword(formData.email, formData.token, formData.newPassword)

    if (result.success) {
      setSuccess("¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.")
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="text-center mb-4">
              <h4>Solicitar Token de Recuperación</h4>
              <p className="text-muted">Contacta al administrador para obtener un token de recuperación</p>
            </div>

            <Form.Group className="mb-4">
              <Form.Label>
                <FaEnvelope className="me-2" />
                Tu Correo Electrónico
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className="py-2"
              />
              <Form.Text className="text-muted">
                Proporciona este email al administrador para que genere tu token
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              size="lg"
              className="w-100 mb-3"
              onClick={() => setStep(2)}
              disabled={!formData.email}
            >
              <FaKey className="me-2" />
              Continuar con Token
            </Button>
          </div>
        )

      case 2:
        return (
          <div>
            <div className="text-center mb-4">
              <h4>Validar Token</h4>
              <p className="text-muted">Ingresa el token proporcionado por el administrador</p>
            </div>

            <Form onSubmit={handleValidateToken}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaEnvelope className="me-2" />
                  Correo Electrónico
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <FaKey className="me-2" />
                  Token de Recuperación
                </Form.Label>
                <Form.Control
                  type="text"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Ej: ABC12345"
                  required
                  className="py-2"
                  style={{ textTransform: "uppercase" }}
                />
              </Form.Group>

              <Button type="submit" variant="primary" size="lg" className="w-100 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Validando...
                  </>
                ) : (
                  <>
                    <FaKey className="me-2" />
                    Validar Token
                  </>
                )}
              </Button>
            </Form>
          </div>
        )

      case 3:
        return (
          <div>
            <div className="text-center mb-4">
              <h4>Nueva Contraseña</h4>
              <p className="text-muted">Ingresa tu nueva contraseña</p>
            </div>

            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="me-2" />
                  Nueva Contraseña
                </Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <FaLock className="me-2" />
                  Confirmar Nueva Contraseña
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu nueva contraseña"
                  required
                  className="py-2"
                />
              </Form.Group>

              <Button type="submit" variant="success" size="lg" className="w-100 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FaLock className="me-2" />
                    Actualizar Contraseña
                  </>
                )}
              </Button>
            </Form>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Container className="min-vh-100 d-flex align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <FaBook size={48} className="text-primary mb-3" />
                <h2 className="fw-bold text-primary">Recuperar Contraseña</h2>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}

              {renderStepContent()}

              <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none">
                  <FaArrowLeft className="me-2" />
                  Volver al Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default RecuperarPassword
