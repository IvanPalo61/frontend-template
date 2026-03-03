import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/LoginPage";
import Productos from "./pages/Productos";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const Dashboard = () => (
  <div>
    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
    <p className="mt-4 text-slate-600">
      Bienvenido al sistema. Selecciona una opción del menú.
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        // ruta publica
        <Route path="/login" element={<Login />} />

        // ruta privada
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;