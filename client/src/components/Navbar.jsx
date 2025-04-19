import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Box } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { getUser, logout } from "./users";
import EditUserModal from "./EditUserModal";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setUserData(user);
      } catch (err) {
        console.error("Error al obtener usuario:", err);
      }
    };

    fetchUser();
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEditUser = (event) => {
    event.preventDefault();
    setModalOpen(true);
    handleMenuClose();
  };

  const refreshUserData = async () => {
    try {
      const updatedUser = await getUser();
      setUserData(updatedUser);
    } catch (err) {
      console.error("Error al actualizar datos del usuario:", err);
    }
  };
  

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">DICOM VIEWER</Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ marginRight: 1 }}>
            {userData ? `${userData.nombre} ${userData.apellido}` : "Cargando..."}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditUser}>Cambiar información</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <EditUserModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        onUpdate={refreshUserData}
      />
    </AppBar>
  );
}