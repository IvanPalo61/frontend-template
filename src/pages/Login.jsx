import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Respuesta login:", data);

      if (!data.token) {
        throw new Error("No se recibió token del servidor");
      }

      localStorage.setItem("token", data.token);

      navigate("/productos");

    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <LogIn className="text-blue-600" /> 
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            className="w-full p-2 border rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;