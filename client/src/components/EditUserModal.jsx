import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button
} from "@mui/material";
import { getUser, editUser } from "./users";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4
};

export default function EditUserModal({ open, handleClose, onUpdate }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  });
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setFormData({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          password: "" // solo si se activa la opción
        });
      } catch (err) {
        console.error("Error al obtener datos del usuario:", err);
      }
    };

    if (open) {
      fetchUser();
      setErrors({});
      setChangePassword(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
        const dataToSend = { ...formData };
        if (!changePassword) {
            delete dataToSend.password;
        }

        await editUser(dataToSend);
        if (onUpdate) onUpdate();
        handleClose();
    } catch (err) {
        if (err.response?.data) {
            setErrors(err.response.data);
        } else {
            console.error("Error al modificar datos:", err);
        }
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>Editar información</Typography>

        <TextField
          label="Nombre"
          name="nombre"
          fullWidth
          margin="normal"
          value={formData.nombre}
          onChange={handleChange}
          error={Boolean(errors.nombre)}
          helperText={errors.nombre}
        />
        <TextField
          label="Apellido"
          name="apellido"
          fullWidth
          margin="normal"
          value={formData.apellido}
          onChange={handleChange}
          error={Boolean(errors.apellido)}
          helperText={errors.apellido}
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
            />
          }
          label="Cambiar contraseña"
        />

        {changePassword && (
          <TextField
            label="Nueva contraseña"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
        )}

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} sx={{ marginRight: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
