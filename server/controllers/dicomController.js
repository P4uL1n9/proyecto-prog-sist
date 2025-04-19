const path = require("path");

const uploadDicom = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }
    res.status(200).json({ message: "Imagen DICOM subida correctamente", path: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadDicom };

