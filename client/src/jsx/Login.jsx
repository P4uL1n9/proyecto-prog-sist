import React, { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../components/users";
import "../css/Login.css";
import ErrorMessage from "../components/errorMessage";
import Loading from "../components/loading";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login( {email: email, password: password} );
            console.log("Respuesta Backend: ",response)
            navigate("/users");
        } catch (error) {
            console.log(error)
            setLoading(false)
            setError(error.response?.data?.message || 'Ocurrio un error');
        }
    };
    
return (
    <div className="login-container">
    <h2>Iniciar sesión</h2>
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Iniciar sesión"}
      </button>
    </form>

    {error && <ErrorMessage message={error} />}

    <p className="register-text">
      ¿No tienes cuenta?{" "}
      <span className="register-link" onClick={() => navigate("/signin")}>
        Regístrate aquí.
      </span>
    </p>
  </div>
  );
};