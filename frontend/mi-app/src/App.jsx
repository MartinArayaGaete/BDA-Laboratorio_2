import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginView from "./views/LoginView.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Layout from "./components/common/Layout.jsx";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

const DashboardView = lazy(() => import("./views/admin/DashboardView.jsx"));
const TorneosListView = lazy(() => import("./views/admin/TorneosListView.jsx"));
const CrearTorneoView = lazy(() => import("./views/admin/CrearTorneoView.jsx"));
const TorneoDetalleView = lazy(() => import("./views/admin/TorneoDetalleView.jsx"));
const UsuariosView = lazy(() => import("./views/admin/UsuariosView.jsx"));
const CategoriasView = lazy(() => import("./views/admin/CategoriasView.jsx"));
const LogsView = lazy(() => import("./views/admin/LogsView.jsx"));
const EstadisticasAdminView = lazy(() => import("./views/admin/EstadisticasAdminView.jsx"));

const ArcherDashboardView = lazy(() => import("./views/archer/ArcherDashboardView.jsx"));
const TorneosView = lazy(() => import("./views/archer/TorneosView.jsx"));
const HistorialView = lazy(() => import("./views/archer/HistorialView.jsx"));
const EstadisticasView = lazy(() => import("./views/archer/EstadisticasView.jsx"));

function lazyRoute(element) {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando vista..." />}>
      {element}
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginView />} />

        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={lazyRoute(<DashboardView />)} />
            <Route path="/admin/torneos" element={lazyRoute(<TorneosListView />)} />
            <Route path="/admin/torneos/crear" element={lazyRoute(<CrearTorneoView />)} />
            <Route
              path="/admin/torneos/:idTorneo"
              element={lazyRoute(<TorneoDetalleView />)}
            />
            <Route path="/admin/usuarios" element={lazyRoute(<UsuariosView />)} />
            <Route path="/admin/categorias" element={lazyRoute(<CategoriasView />)} />
            <Route path="/admin/logs" element={lazyRoute(<LogsView />)} />
            <Route path="/admin/estadisticas" element={lazyRoute(<EstadisticasAdminView />)} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ARQUERO"]} />}>
            <Route path="/archer" element={lazyRoute(<ArcherDashboardView />)} />
            <Route path="/archer/torneos" element={lazyRoute(<TorneosView />)} />
            <Route path="/archer/historial" element={lazyRoute(<HistorialView />)} />
            <Route path="/archer/estadisticas" element={lazyRoute(<EstadisticasView />)} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
