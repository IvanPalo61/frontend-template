import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Productos from './pages/Productos';

const Dashboard = () => (
  <div>
    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
    <p className="mt-4 text-slate-600">Bienvenido al sistema. Selecciona una opción del menú.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* El Layout envuelve todas las rutas */}
      <Layout>
        <Routes>
          {/* Redireccionar raíz a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;