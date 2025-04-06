import React, { useState } from "react";
import { useNavigate } from "react-router";
import { createUser } from "../components/users";
import "../css/Login.css";
import ErrorMessage from "../components/errorMessage";

export default function Signin() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Agregar "type": "usuario" directamente
      const response = await createUser({ ...formData, type: "usuario" });
      console.log("Usuario creado:", response);
      navigate("/"); // Redirige al login
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
        error.response?.data?.Email ||
        "Ocurrió un error al crear la cuenta"
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      {error && <ErrorMessage message={error} />}

      <p className="register-text">
        ¿Ya tienes cuenta?{" "}
        <span className="register-link" onClick={() => navigate("/")}>
          Inicia sesión aquí.
        </span>
      </p>
    </div>
  );
}
