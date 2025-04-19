import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function DicomHeaderModal({ open, onClose, headerData }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Cabecera DICOM</DialogTitle>
      <DialogContent dividers>
        <List dense>
          {Object.entries(headerData).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText primary={key} secondary={String(value)} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}