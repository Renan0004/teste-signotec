import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Componente simplificado para evitar problemas de renderização
const FormModal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      keepMounted={false}
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ 
        p: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {!loading && (
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 2, pt: 3 }}>
        <Box sx={{ minHeight: isMobile ? 'auto' : '200px' }}>
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal; 