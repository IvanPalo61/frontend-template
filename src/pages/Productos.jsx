import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Producto() {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function cargarProductos() {
      const data = await api.get("/productos");
      setProductos(data);
      setLoading(false);
    }

    cargarProductos();

  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h2>Productos</h2>

      {productos.length === 0 ? (
        <p>No hay productos</p>
      ) : (
        <ul>
          {productos.map(p => (
            <li key={p.id}>
              {p.nombre} - ${p.precio} -{p.stock} - {p.descripcion}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
