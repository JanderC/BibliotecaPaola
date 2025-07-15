import { Container, Row, Col } from "react-bootstrap"
import { FaHeart, FaCode } from "react-icons/fa"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6}>
            <h5>Sistema de Biblioteca</h5>
            <p className="mb-0">Gestión moderna y eficiente de recursos bibliográficos</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-2">
              <strong>Desarrollado por:</strong>
            </p>
            <p className="mb-1">• Paola Ayala 32.610.922 - Frontend Developer</p>
            <p className="mb-1">• Nelson sierra 31.434.372 - Backend Developer</p>
            <p className="mb-1">• Jean Avila 32.758.597 - Database Designer</p>
            <p className="mb-0">• Johnson Novoa 31.680.987 - UI/UX Designer</p>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              © {currentYear} Sistema de Biblioteca. Hecho con <FaHeart className="text-danger mx-1" />y{" "}
              <FaCode className="text-info mx-1" />
              para la comunidad educativa.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
