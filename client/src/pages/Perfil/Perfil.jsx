import { Container, Row, Col, Card, Form, Button } from "react-bootstrap"
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"

const Perfil = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3>
                <FaUser className="me-2" />
                Mi Perfil
              </h3>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-2" />
                        Nombre Completo
                      </Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue="Usuario Ejemplo"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2" />
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        defaultValue="usuario@ejemplo.com"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPhone className="me-2" />
                        Teléfono
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        defaultValue="+1234567890"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaMapMarkerAlt className="me-2" />
                        Dirección
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        defaultValue="Dirección ejemplo"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="text-end">
                  <Button variant="primary">
                    Actualizar Perfil
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Perfil