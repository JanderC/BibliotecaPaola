import { Container, Row, Col, Button, Table, Badge } from "react-bootstrap"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"

const Usuarios = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Gestión de Usuarios</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Nuevo Usuario
          </Button>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Usuario Ejemplo</td>
                <td>usuario@ejemplo.com</td>
                <td>
                  <Badge bg="primary">Usuario</Badge>
                </td>
                <td>
                  <Badge bg="success">Activo</Badge>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">
                    <FaEdit />
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  )
}

export default Usuarios