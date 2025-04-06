import React, { useEffect } from 'react';

const ErrorMessage = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose?.();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    // Si no hay mensaje, no mostrar nada
    if (!message) return null;

    return (
        <div style={{
            position: 'fixed', // Fijo en la pantalla
            top: '5.5%', // Parte superior de la pantalla
            left: '50%',
            transform: 'translateX(-50%)', // Centrar horizontalmente
            width: '90%', // Ancho del mensaje
            maxWidth: '600px', // Máximo ancho del mensaje
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            padding: '10px',
            margin: '10px 0',
            zIndex: 10000, // Asegurarse que esté sobre todo el contenido
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <span>{message}</span>
        </div>
    );
};

export default ErrorMessage;