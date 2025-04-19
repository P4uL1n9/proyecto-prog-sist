import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Input,
  Select,
  MenuItem
} from "@mui/material";
import Navbar from "../components/Navbar.jsx";
import DicomHeaderModal from "../components/DicomHeaderModal";

import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
  useWebWorkers: true,
  webWorkerPath: "/cornerstone/cornerstoneWADOImageLoaderWebWorker.js",
  taskConfiguration: {
    decodeTask: {
      codecsPath: "/cornerstone/cornerstoneWADOImageLoaderCodecs.js"
    }
  }
});

export default function Viewer() {
  const basePath = process.env.REACT_APP_API_URL;
  const [imageIds, setImageIds] = useState([]);
  const [status, setStatus] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNegative, setIsNegative] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const viewerRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [headerOpen, setHeaderOpen] = useState(false);
  const [headerData, setHeaderData] = useState({});

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setProjectName("");
    setSelectedFiles([]);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).filter(file => file.name.endsWith(".dcm"));
    setSelectedFiles(files);
  };

  const handleCreateAndUpload = async () => {
    if (!projectName || selectedFiles.length === 0) return;
    try {
      await axios.post("/projects/create", { name: projectName }, { withCredentials: true });

      const formData = new FormData();
      formData.append("projectName", projectName);
      selectedFiles.forEach(file => formData.append("dicomFiles", file));

      const response = await axios.post("/dicom/uploadToProject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      const paths = response.data.paths.map(
        (path) => `wadouri:${basePath}/${path.replace(/\\/g, "/")}`
      );

      setImageIds(paths);
      setStatus("Imágenes subidas correctamente");
      setCurrentIndex(0);
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear proyecto o subir archivos:", error);
      setStatus("Error al crear proyecto o subir las imágenes DICOM");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/projects", { withCredentials: true });
      setProjects(response.data);
      setSelectModalOpen(true);
    } catch (err) {
      console.error("Error al obtener proyectos:", err);
      setStatus("No se pudieron cargar los proyectos");
    }
  };

  const loadImagesFromProject = async () => {
    if (!selectedProject) return;
    try {
      const user = await axios.get("/users/getUser", { withCredentials: true });
      const userId = user.data.ID;

      const filesResponse = await axios.get(`/dicom/list/${selectedProject}`, {
        withCredentials: true
      });

      const filenames = filesResponse.data;
      const paths = filenames.map(
        (filename) => `wadouri:${basePath}/uploads/${userId}/${selectedProject}/${filename}`
      );

      setImageIds(paths);
      setCurrentIndex(0);
      setStatus("Imágenes del proyecto cargadas correctamente");
      setSelectModalOpen(false);
    } catch (err) {
      console.error("Error al cargar imágenes del proyecto:", err);
      setStatus("No se pudieron cargar las imágenes del proyecto");
    }
  };

  const showDicomHeader = async () => {
    try {
      const element = viewerRef.current;
      const imageId = imageIds[currentIndex];
  
      const image = cornerstone.getImage(element); // imagen ya mostrada
      const dataSet = image.data;
  
      if (!dataSet || !dataSet.string) {
        throw new Error("No se pudo obtener los metadatos");
      }
  
      const info = {
        "Patient Name": dataSet.string("x00100010") || "No disponible",
        "Patient ID": dataSet.string("x00100020") || "No disponible",
        "Modality": dataSet.string("x00080060") || "No disponible",
        "Study Date": dataSet.string("x00080020") || "No disponible",
        "Manufacturer": dataSet.string("x00080070") || "No disponible",
        "Study Description": dataSet.string("x00081030") || "No disponible",
        "Series Description": dataSet.string("x0008103e") || "No disponible",
        "Institution Name": dataSet.string("x00080080") || "No disponible"
      };
  
      setHeaderData(info);
      setHeaderOpen(true);
    } catch (err) {
      console.error("Error al obtener cabecera DICOM:", err);
      setHeaderData({});
      setStatus("No se pudo obtener la cabecera DICOM");
    }
  };
  

  useEffect(() => {
    if (imageIds.length > 0 && viewerRef.current) {
      const element = viewerRef.current;
      cornerstone.enable(element);

      cornerstone.loadAndCacheImage(imageIds[currentIndex])
        .then((image) => {
          const viewport = cornerstone.getDefaultViewportForImage(element, image);
          if (image.windowWidth && image.windowCenter) {
            viewport.voi.windowWidth = image.windowWidth;
            viewport.voi.windowCenter = image.windowCenter;
          }
          viewport.invert = isNegative;
          if (isHighContrast) {
            viewport.voi.windowWidth = 1000;
            viewport.voi.windowCenter = 500;
          }
          cornerstone.displayImage(element, image, viewport);
        })
        .catch((err) => {
          console.error("Error al mostrar imagen:", err);
          setStatus("No se pudo visualizar la imagen DICOM");
        });
    }
  }, [imageIds, currentIndex, isNegative, isHighContrast]);

  return (
    <>
      <Navbar />
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button variant="contained" onClick={handleOpenModal} sx={{ mr: 2 }}>
          Crear Proyecto
        </Button>
        <Button variant="outlined" onClick={fetchProjects} sx={{ mr: 2 }}>
          Buscar Proyecto
        </Button>
        <Button variant="outlined" onClick={() => setIsNegative(!isNegative)} sx={{ mr: 2 }}>
          {isNegative ? "Modo Normal" : "Modo Negativo"}
        </Button>
        <Button variant="outlined" onClick={() => setIsHighContrast(!isHighContrast)} sx={{ mr: 2 }}>
          {isHighContrast ? "Contraste Normal" : "Contraste Alto"}
        </Button>
        <Button variant="outlined" onClick={showDicomHeader}>
          Ver Cabecera DICOM
        </Button>

        <Typography mt={2} sx={{ color: "#ffffff" }}>
          {status}
        </Typography>

        {imageIds.length > 0 && (
          <>
            <Box
              ref={viewerRef}
              id="dicom-viewer"
              sx={{
                width: 1024,
                height: 512,
                margin: "40px auto",
                border: "2px solid #1976d2",
                backgroundColor: "#000"
              }}
            />
            <Box sx={{ width: 512, margin: "0 auto" }}>
              <Slider
                min={0}
                max={imageIds.length - 1}
                value={currentIndex}
                onChange={(e, val) => setCurrentIndex(val)}
                aria-label="Selector de corte"
              />
              <Typography mt={2} sx={{ color: "#ffffff" }}>
                Corte: {currentIndex + 1} / {imageIds.length}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Crear nuevo proyecto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del proyecto"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Input
            type="file"
            inputProps={{ multiple: true }}
            onChange={handleFileChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleCreateAndUpload}
            disabled={!projectName || selectedFiles.length === 0}
          >
            Crear y subir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={selectModalOpen} onClose={() => setSelectModalOpen(false)}>
        <DialogTitle>Selecciona un proyecto</DialogTitle>
        <DialogContent>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            fullWidth
          >
            {projects.map((proj) => (
              <MenuItem key={proj.id} value={proj.name}>
                {proj.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectModalOpen(false)}>Cancelar</Button>
          <Button onClick={loadImagesFromProject} disabled={!selectedProject}>
            Cargar
          </Button>
        </DialogActions>
      </Dialog>

      <DicomHeaderModal
        open={headerOpen}
        onClose={() => setHeaderOpen(false)}
        headerData={headerData}
      />
    </>
  );
}
