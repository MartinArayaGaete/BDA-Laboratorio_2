import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.rol === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = isAdmin
    ? [
        { path: "/admin", label: "Dashboard" },
        { path: "/admin/torneos", label: "Torneos" },
        { path: "/admin/usuarios", label: "Usuarios" },
        { path: "/admin/categorias", label: "Categorías" },
        { path: "/admin/logs", label: "Auditoría" },
        { path: "/admin/estadisticas", label: "Estadísticas" },
      ]
    : [
        { path: "/archer", label: "Mi Panel" },
        { path: "/archer/torneos", label: "Torneos" },
        { path: "/archer/historial", label: "Historial" },
        { path: "/archer/estadisticas", label: "Estadísticas" },
      ];

  const isActive = (path) => {
    if (path === "/admin" || path === "/archer") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="bg-dark text-white d-flex flex-column flex-shrink-0"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="px-3 py-4 text-center border-bottom border-secondary">
        <h4 className="text-warning mb-1">Sistema de Arquería</h4>
        <small className="text-white-50">
          {isAdmin ? "Administrador" : "Arquero"}
        </small>
      </div>

      {/* Menú */}
      <nav className="flex-grow-1 px-2 py-3">
        <ul className="nav flex-column gap-1">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <button
                className={`nav-link text-start w-100 btn rounded-3 ${
                  isActive(item.path)
                    ? "bg-warning text-dark fw-bold"
                    : "text-white-50"
                }`}
                onClick={() => navigate(item.path)}
                style={{
                  transition: "all 0.2s",
                  padding: "10px 15px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "";
                  }
                }}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Usuario y Logout */}
      <div className="px-3 py-3 border-top border-secondary mt-auto">
        <div className="text-center mb-3">
          <div className="text-white small fw-bold">
            {user?.nombre || "Usuario"}
          </div>
          <div className="text-white-50 small">{user?.rut}</div>
          <span
            className={`badge mt-1 ${isAdmin ? "bg-warning text-dark" : "bg-info text-dark"}`}
          >
            {user?.rol}
          </span>
        </div>
        <button
          className="btn btn-outline-light w-100 btn-sm rounded-3"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
