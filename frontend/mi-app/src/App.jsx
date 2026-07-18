import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginView from "./views/LoginView.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Layout from "./components/common/Layout.jsx";

// Vistas Admin
import DashboardView from "./views/admin/DashboardView.jsx";
import TorneosListView from "./views/admin/TorneosListView.jsx";
import CrearTorneoView from "./views/admin/CrearTorneoView.jsx";
import TorneoDetalleView from "./views/admin/TorneoDetalleView.jsx";
import UsuariosView from "./views/admin/UsuariosView.jsx";
import CategoriasView from "./views/admin/CategoriasView.jsx";
import LogsView from "./views/admin/LogsView.jsx";

// Vistas Arquero
import ArcherDashboardView from "./views/archer/ArcherDashboardView.jsx";
import TorneosView from "./views/archer/TorneosView.jsx";
import HistorialView from "./views/archer/HistorialView.jsx";
import EstadisticasView from "./views/archer/EstadisticasView.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginView />} />

        {/* Rutas protegidas con Layout */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ARQUERO"]} />}>
          <Route element={<Layout />}>
            {/* Rutas de ADMIN */}
            <Route path="/admin" element={<DashboardView />} />
            <Route path="/admin/torneos" element={<TorneosListView />} />
            <Route path="/admin/torneos/crear" element={<CrearTorneoView />} />
            <Route
              path="/admin/torneos/:idTorneo"
              element={<TorneoDetalleView />}
            />
            <Route path="/admin/usuarios" element={<UsuariosView />} />
            <Route path="/admin/categorias" element={<CategoriasView />} />
            <Route path="/admin/logs" element={<LogsView />} />

            {/* Rutas de ARQUERO */}
            <Route path="/archer" element={<ArcherDashboardView />} />
            <Route path="/archer/torneos" element={<TorneosView />} />
            <Route path="/archer/historial" element={<HistorialView />} />
            <Route path="/archer/estadisticas" element={<EstadisticasView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
