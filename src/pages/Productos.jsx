import { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  ShoppingBag,
  Loader,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  MessageCircle,
  Twitter,
  Share2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons (avoids missing images)
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const compartirWhatsApp = (producto) => {
  // 1. Redactamos la carta con los datos reales de la BD
  const mensaje = `¡Mira lo que encontré en la tienda!\n\n${producto.nombre}\n$${producto.precio}\n\n¿Te interesa?`;

  // 2. Empacamos el mensaje para que la URL no explote
  const textoCodificado = encodeURIComponent(mensaje);

  // 3. Enviamos al usuario a la oficina de correos (Abre pestaña nueva)
  window.open(`https://api.whatsapp.com/send?text=${textoCodificado}`, '_blank');
};

const compartirTwitter = (producto) => {
  const mensaje = `Increíble producto en la tienda: ${producto.nombre} por solo $${producto.precio}. ¡Tienen que verlo! #InventarioPro`;
  const textoCodificado = encodeURIComponent(mensaje);

  window.open(`https://twitter.com/intent/tweet?text=${textoCodificado}`, '_blank');
};

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
    imagen_url: '',
    youtube_url: '',
    latitud: '',
    longitud: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/productos');
      // response.data se asume que es el array de productos; si tu API devuelve otra estructura, ajusta aquí
      setProductos(response.data ?? response);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError('No se pudo conectar con el servidor. ¿Está encendido?');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
        imagen_url: formData.imagen_url.trim(),
        youtube_url: formData.youtube_url.trim(),
        latitud: formData.latitud.trim(),
        longitud: formData.longitud.trim()
      };

      const response = await api.post('/productos/crear', payload);

      setSuccessMessage(response.data?.message || response.message || 'Producto creado correctamente');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      setShowForm(false);
      setFormData({
        nombre: '',
        precio: '',
        categoria: '',
        descripcion: '',
        imagen_url: '',
        youtube_url: '',
        latitud: '',
        longitud: ''
      });

      cargarProductos();
    } catch (err) {
      console.error('Error en POST:', err);

      const status = err?.response?.status ?? '';
      if (String(status).includes('400')) {
        alert('Error en los datos enviados. Revisa los campos.');
      } else if (String(status).includes('401')) {
        alert('No estás autenticado. Por favor inicia sesión.');
      } else if (String(status).includes('403')) {
        alert('No tienes permisos para crear productos.');
      } else {
        alert('Error al crear el producto');
      }
    }
  };

  const parseCoord = (val, fallback) => {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
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

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          {successMessage}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 flex flex-col gap-4">
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
          <input
            type="text"
            name="youtube_url"
            placeholder="URL de YouTube"
            value={formData.youtube_url}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="latitud"
            placeholder="latitud"
            value={formData.latitud}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="longitud"
            placeholder="longitud"
            value={formData.longitud}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Guardar
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((prod) => {
          const defaultLat = 19.432608;
          const defaultLng = -99.133209;
          const lat = parseCoord(prod.latitud, defaultLat);
          const lng = parseCoord(prod.longitud, defaultLng);

          const getYoutubeEmbed = (url) => {
            if (!url) return null;
            if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
            return url;
          };

          return (
            <div
              key={prod.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="h-48 p-4 bg-white flex items-center justify-center border-b border-slate-50">
                {prod.youtube_url ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYoutubeEmbed(prod.youtube_url)}
                    title={`YouTube video player - ${prod.nombre}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img
                    src={prod.imagen_url || 'https://via.placeholder.com/150'}
                    alt={prod.nombre}
                    className="max-h-full object-contain"
                  />
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{prod.nombre}</h3>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">${prod.precio}</span>
                </div>

                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {prod.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              <div className="pt-3 flex justify-between items-center bg-slate-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Share2 size={14} /> Compartir:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => compartirWhatsApp(prod)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition shadow-sm"
                    title="Compartir en WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    onClick={() => compartirTwitter(prod)}
                    className="bg-black hover:bg-slate-800 text-white p-2 rounded-full transition shadow-sm"
                    title="Compartir en X (Twitter)"
                  >
                    <Twitter size={16} />
                  </button>
                </div>
              </div>

              <div className="h-48 w-full border-t border-slate-100 z-0 relative">
                <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>
                      Ubicación de: <br /> <strong>{prod.nombre}</strong>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Productos;