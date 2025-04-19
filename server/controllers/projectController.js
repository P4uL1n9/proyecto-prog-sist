const db = require('../config/database');
const fs = require("fs");
const path = require("path");

const createProject = async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  if (!name) {
    return res.status(400).json({ error: "El nombre del proyecto es obligatorio" });
  }

  try {
    // 1. Insertar en la base de datos
    const [result] = await db.promise().query(
      "INSERT INTO projects (user_id, name) VALUES (?, ?)",
      [userId, name]
    );

    // 2. Crear carpeta en uploads/<userId>/<projectName>
    const projectPath = path.join("uploads", String(userId), name);
    fs.mkdirSync(projectPath, { recursive: true });

    res.status(201).json({ message: "Proyecto creado correctamente", projectId: result.insertId });
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const getUserProjects = async (req, res) => {
  const userId = req.userId;

  try {
    const [projects] = await db.promise().query(
      "SELECT id, name, created_at FROM Projects WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { createProject, getUserProjects };