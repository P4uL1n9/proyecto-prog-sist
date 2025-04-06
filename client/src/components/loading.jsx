import React from 'react';

const Loading = ({ message }) => {
    return (
        <div 
            className="d-flex flex-column justify-content-center align-items-center" 
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro con opacidad
                zIndex: 9999 // Asegura que esté por encima de todo el contenido
            }}
        >
            <div 
                className="spinner-border" 
                role="status" 
                style={{ width: '4rem', height: '4rem', opacity: 0.9 }} // Spinner con opacidad baja
            >
                <span className="sr-only"></span>
            </div>
            <p 
                className="mt-3" 
                style={{ fontSize: '1.2rem', color: '#ffffff', opacity: 0.9 }} // Texto con opacidad baja
            >
                {message || 'Cargando...'}
            </p>
        </div>
    );
};

export default Loading;