import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Loader, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    descripcion: '',
    imagen_url: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/productos');
      setProductos(response);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError("No se pudo conectar con el servidor. ¿Está encendido?");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.precio || !formData.categoria.trim()) {
      alert('Nombre, precio y categoría son obligatorios');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para crear productos');
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        precio: Number(formData.precio),
        categoria: formData.categoria.trim(),
        descripcion: formData.descripcion.trim(),
        imagen_url: formData.imagen_url.trim()
      };

      const response = await api.post('/productos/crear', payload);

      // Mostrar mensaje éxito
      setSuccessMessage(response.message || "Producto creado correctamente");

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // Reset formulario
      setShowForm(false);
      setFormData({
        nombre: '',
        precio: '',
        categoria: '',
        descripcion: '',
        imagen_url: ''
      });

      cargarProductos();

    } catch (err) {
      console.error('Error en POST:', err);

      if (err.message?.includes('400')) {
        alert('Error en los datos enviados. Revisa los campos.');
      } else if (err.message?.includes('401')) {
        alert('No estás autenticado. Por favor inicia sesión.');
      } else if (err.message?.includes('403')) {
        alert('No tienes permisos para crear productos.');
      } else {
        alert('Error al crear el producto');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Inventario
        </h1>

        <div className="flex gap-4 items-center">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {productos?.length || 0} items
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <PlusCircle /> Crear Producto
          </button>
        </div>
      </header>

      {/* 🔥 ALERTA DE ÉXITO */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          {successMessage}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-6 flex flex-col gap-4"
        >
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={formData.precio}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="categoria"
            placeholder="Categoría"
            value={formData.categoria}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="imagen_url"
            placeholder="URL Imagen"
            value={formData.imagen_url}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="h-48 p-4 bg-white flex items-center justify-center border-b border-slate-50">
              <img
                src={prod.imagen_url || "https://via.placeholder.com/150"}
                alt={prod.nombre}
                className="max-h-full object-contain"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">
                  {prod.nombre}
                </h3>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                  ${prod.precio}
                </span>
              </div>

              <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                {prod.descripcion || "Sin descripción disponible."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;