import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-box">
        <h2>Bienvenido al Visualizador DICOM</h2>
        <p>
          Esta plataforma te permite cargar imágenes médicas en formato DICOM
          para analizarlas de forma interactiva. Puedes navegar entre las
          distintas vistas (axial, sagital, coronal) y moverte entre los frames.
        </p>
        <p>
          Para comenzar, haz clic en el siguiente botón y carga tus imágenes DICOM.
        </p>
        <button onClick={() => navigate("/viewer")}>
          Ir a cargar imágenes
        </button>
      </div>
    </div>
  );
}