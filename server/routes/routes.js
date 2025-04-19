const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UserController = require("../controllers/userController");
const { uploadDicom } = require("../controllers/dicomController");
const { createProject, getUserProjects } = require("../controllers/projectController");
const verifyToken = require("../middleware/Auth");

// 📂 Filtro solo para .dcm
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".dcm") {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos .dcm"));
  }
};

// 🧠 Storage dinámico por proyecto y usuario
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.userId;
    const projectName = req.body.projectName;
    const uploadPath = path.join("uploads", String(userId), projectName);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage, fileFilter });

// 👤 Usuarios
router.post("/users/create", UserController.createUser);
router.post("/users/Login", UserController.login);
router.get("/users/Protected", UserController.protected);
router.post("/users/Logout", UserController.logout);
router.get("/users/getUser", verifyToken, UserController.getUser);
router.get("/users/getUsers", verifyToken, UserController.getUsers);
router.put("/users/modify", verifyToken, UserController.modify);

// 📁 Proyectos
router.post("/projects/create", verifyToken, createProject);
router.get("/projects", verifyToken, getUserProjects);

// 🚀 NUEVO: subir a proyecto con carpeta personalizada
router.post(
  "/dicom/uploadToProject",
  verifyToken,
  upload.array("dicomFiles", 200),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No se subió ningún archivo" });
      }

      const paths = req.files.map((file) => file.path);
      res.status(200).json({ message: "Imágenes subidas correctamente", paths });
    } catch (error) {
      console.error("Error al subir múltiples archivos:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/dicom/list/:projectName", verifyToken, (req, res) => {
    const userId = req.userId;
    const projectName = req.params.projectName;
  
    const folderPath = path.join("uploads", String(userId), projectName);
  
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Error al leer archivos del proyecto:", err);
        return res.status(500).json({ error: "No se pudieron leer los archivos" });
      }
  
      const dicomFiles = files.filter((file) => file.endsWith(".dcm"));
      res.json(dicomFiles);
    });
});

module.exports = router;