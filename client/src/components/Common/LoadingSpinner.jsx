import { Spinner, Container, Row, Col } from "react-bootstrap"

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
      <Row>
        <Col className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">{message}</p>
        </Col>
      </Row>
    </Container>
  )
}

export default LoadingSpinner
