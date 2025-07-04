import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const FormModal = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
  hideActions = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            {!loading && (
              <IconButton
                edge="end"
                color="inherit"
                onClick={onClose}
                aria-label="close"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>{children}</DialogContent>

        {!hideActions && (
          <DialogActions>
            <Button
              onClick={onClose}
              disabled={loading}
              color="inherit"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Salvando...' : submitLabel}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
};

export default FormModal; 