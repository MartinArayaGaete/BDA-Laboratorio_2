import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import usuarioService from "../api/apiUsuarios.js";

export default function LoginView() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados para registro
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setRut("");
    setPassword("");
    setNombre("");
    setCorreo("");
    setRolSeleccionado("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    resetForm();
  };

  const handleRutChange = (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, ""); // Solo números y K

    if (value.length > 1) {
      const dv = value.slice(-1); // (dígito verificador)
      const numeros = value.slice(0, -1); // El resto
      value = numeros + "-" + dv;
    }

    setRut(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!rut.trim()) {
      setError("Ingrese su RUT");
      return;
    }

    // Validar formato de RUT (debe tener guion)
    if (!rut.includes("-")) {
      setError("Formato de RUT inválido. Use el formato: 12345678-9");
      return;
    }

    const partes = rut.split("-");
    if (partes.length !== 2 || partes[0].length < 1 || partes[1].length !== 1) {
      setError("Formato de RUT inválido. Use el formato: 12345678-9");
      return;
    }

    if (!password.trim()) {
      setError("Ingrese su contraseña");
      return;
    }

    setLoading(true);
    try {
      // Enviar RUT con guion al backend
      const user = await login(rut, password);

      if (user.rol === "ADMIN") {
        navigate("/admin");
      } else if (user.rol === "ARQUERO") {
        navigate("/archer");
      } else {
        setError("Rol no reconocido. Contacte al administrador.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("RUT o contraseña incorrectos");
      } else if (err.response?.status === 500) {
        setError("Error del servidor. Intente nuevamente más tarde.");
      } else if (err.message === "Network Error") {
        setError("No se pudo conectar con el servidor. Verifique su conexión.");
      } else {
        setError("Error al iniciar sesión. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!rut.trim()) {
      setError("Ingrese su RUT");
      return;
    }

    // Validar formato de RUT
    if (!rut.includes("-")) {
      setError(
        "Formato de RUT inválido. Use el formato: 12345678-9 (sin puntos)",
      );
      return;
    }

    const partes = rut.split("-");
    if (partes.length !== 2 || partes[0].length < 1 || partes[1].length !== 1) {
      setError(
        "Formato de RUT inválido. Use el formato: 12345678-9 (sin puntos)",
      );
      return;
    }

    if (!nombre.trim()) {
      setError("Ingrese su nombre completo");
      return;
    }
    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (!correo.trim()) {
      setError("Ingrese su correo electrónico");
      return;
    }
    if (!correo.includes("@") || !correo.includes(".")) {
      setError(
        "Ingrese un correo electrónico válido (ej: usuario@dominio.com)",
      );
      return;
    }
    if (!rolSeleccionado) {
      setError("Seleccione un rol (Arquero o Admin)");
      return;
    }
    if (!password.trim()) {
      setError("Ingrese una contraseña");
      return;
    }
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      // Enviar RUT con guion (sin limpiar)
      await usuarioService.crearUsuario({
        rut: rut, // Se envía con guion: "12345678-9"
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena: password,
        rol: rolSeleccionado,
      });

      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      resetForm();

      // Cambiar a modo login después de 2 segundos
      setTimeout(() => {
        setIsRegistering(false);
        setSuccess("");
      }, 500);
    } catch (err) {
      if (err.response?.status === 400) {
        const msg = err.response?.data?.error || err.response?.data;
        if (typeof msg === "string" && msg.toLowerCase().includes("rut")) {
          setError("El RUT ingresado ya está registrado en el sistema");
        } else {
          setError(
            typeof msg === "string"
              ? msg
              : "Datos inválidos. Verifique la información ingresada.",
          );
        }
      } else if (err.response?.status === 409) {
        setError("El RUT ingresado ya está registrado en el sistema");
      } else if (err.response?.status === 500) {
        setError("Error del servidor. Intente nuevamente más tarde.");
      } else {
        setError("Error al registrarse. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: "440px", borderRadius: "15px" }}
      >
        <div className="card-body p-4">
          {/* Logo y título */}
          <div className="text-center mb-4">
            <h3 className="fw-bold text-dark mt-2">
              Sistema de torneos de Arquería
            </h3>
            <p className="text-muted">
              {isRegistering ? "Crear Nueva Cuenta" : ""}
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <small>{error}</small>
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              <small>{success}</small>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess("")}
              ></button>
            </div>
          )}

          {/* Formulario de Login */}
          {!isRegistering && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  RUT <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">🪪</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="12345678-9"
                    value={rut}
                    onChange={handleRutChange}
                    maxLength="11"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <small className="text-muted">
                  Formato: sin puntos, con guion (ej: 12345678-9)
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">🔒</span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-bold mb-3"
                disabled={loading}
                style={{ borderRadius: "10px" }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Ingresando...
                  </>
                ) : (
                  "Ingresar al Sistema"
                )}
              </button>

              <div className="text-center">
                <small className="text-muted">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                    onClick={toggleMode}
                  >
                    Regístrate aquí
                  </button>
                </small>
              </div>
            </form>
          )}

          {/* Formulario de Registro */}
          {isRegistering && (
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  RUT <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">🪪</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="12345678-9"
                    value={rut}
                    onChange={handleRutChange}
                    maxLength="11"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <small className="text-muted">
                  Sin puntos, con guion (ej: 12345678-9).
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  Nombre Completo <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">👤</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  Correo Electrónico <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">📧</span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="correo@ejemplo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  Rol <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn flex-grow-1 ${
                      rolSeleccionado === "ARQUERO"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setRolSeleccionado("ARQUERO")}
                    disabled={loading}
                  >
                    Arquero
                  </button>
                  <button
                    type="button"
                    className={`btn flex-grow-1 ${
                      rolSeleccionado === "ADMIN"
                        ? "btn-danger"
                        : "btn-outline-danger"
                    }`}
                    onClick={() => setRolSeleccionado("ADMIN")}
                    disabled={loading}
                  >
                    Admin
                  </button>
                </div>
                {rolSeleccionado && (
                  <small className="text-muted mt-1 d-block">
                    {rolSeleccionado === "ARQUERO"
                      ? "Podrás inscribirte en torneos y ver tu historial"
                      : "Podrás crear y gestionar torneos, usuarios y categorías"}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">🔒</span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Mínimo 4 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">
                  Confirmar Contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">🔒</span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 py-2 fw-bold mb-3"
                disabled={loading}
                style={{ borderRadius: "10px" }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Registrando...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </button>

              <div className="text-center">
                <small className="text-muted">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                    onClick={toggleMode}
                  >
                    Inicia sesión aquí
                  </button>
                </small>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center mt-3">
            <small className="text-muted">
              ¿Problemas para ingresar? Contacte al 800 000 6767
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
