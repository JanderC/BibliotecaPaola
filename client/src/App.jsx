import { Routes, Route, Navigate } from "react-router-dom"
import { Container } from "react-bootstrap"

import { useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Layout/Navbar"
import Footer from "./components/Layout/Footer"
import LoadingSpinner from "./components/Common/LoadingSpinner"

// Páginas
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import RecuperarPassword from "./pages/Auth/RecuperarPassword"
import Dashboard from "./pages/Dashboard/Dashboard"
import Libros from "./pages/Libros/Libros"
import Prestamos from "./pages/Prestamos/Prestamos"
import Usuarios from "./pages/Usuarios/Usuarios"
import Perfil from "./pages/Perfil/Perfil"

// Componente de ruta protegida
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.rol !== "administrador") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Componente de ruta pública (solo para no autenticados)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { user } = useAuth()

  return (
    <div className="App d-flex flex-column min-vh-100">
      {user && <Navbar />}

      <main className="flex-grow-1">
        <Container fluid className={user ? "py-4" : ""}>
          <Routes>
            {/* Rutas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/recuperar-password"
              element={
                <PublicRoute>
                  <RecuperarPassword />
                </PublicRoute>
              }
            />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/libros"
              element={
                <ProtectedRoute>
                  <Libros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prestamos"
              element={
                <ProtectedRoute>
                  <Prestamos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </main>

      {user && <Footer />}
    </div>
  )
}

export default App
