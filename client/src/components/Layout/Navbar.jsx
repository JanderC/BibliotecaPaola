"use client"
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { FaBook, FaUsers, FaChartBar, FaUser, FaSignOutAlt } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"

const Navbar = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container>
        <LinkContainer to="/dashboard">
          <BootstrapNavbar.Brand>
            <FaBook className="me-2" />
            Sistema Biblioteca
          </BootstrapNavbar.Brand>
        </LinkContainer>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/dashboard">
              <Nav.Link>
                <FaChartBar className="me-1" />
                Dashboard
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/libros">
              <Nav.Link>
                <FaBook className="me-1" />
                Libros
              </Nav.Link>
            </LinkContainer>

            <Nav.Link as={Link} to="/prestamos">
              <FaUsers className="me-1" />
              {user?.rol === "administrador" ? "Préstamos" : "Mis Préstamos"}
            </Nav.Link>

            {user?.rol === "administrador" && (
              <LinkContainer to="/usuarios">
                <Nav.Link>
                  <FaUsers className="me-1" />
                  Usuarios
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>

          <Nav>
            <NavDropdown
              title={
                <>
                  <FaUser className="me-1" />
                  {user?.nombre}
                </>
              }
              id="user-dropdown"
            >
              <LinkContainer to="/perfil">
                <NavDropdown.Item>
                  <FaUser className="me-2" />
                  Mi Perfil
                </NavDropdown.Item>
              </LinkContainer>

              <NavDropdown.Divider />

              <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Cerrar Sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
