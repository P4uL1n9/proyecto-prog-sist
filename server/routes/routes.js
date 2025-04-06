const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const verifyToken = require('../middleware/Auth');

// 👤 Usuarios
router.post("/users/create", UserController.createUser);  // Crear usuario
router.post("/users/Login", UserController.login);            // Iniciar sesión
router.get("/users/Protected", UserController.protected);
router.post("/users/Logout", UserController.logout);  
router.get("/users/getUser", verifyToken, UserController.getUser);            // Obtener usuario
router.get("/users/getUsers", verifyToken, UserController.getUsers);       // Obtener todos los usuarios
router.put("/users/modify", verifyToken, UserController.modify);  // Modificar usuario

module.exports = router;