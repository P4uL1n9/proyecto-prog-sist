import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import axios from "axios";
import Loading from "../components/loading";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Estado para la autenticación

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get('/users/Protected');
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error al obtener datos protegidos:', error.response?.data?.message || error.message);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <Loading message = "Autenticando usuario..."/>;
    }

    return isAuthenticated ? (children || <Outlet />) : <Navigate to="/" />;
};

export default ProtectedRoute;