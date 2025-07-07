import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Componente simplificado para evitar problemas de renderização
const FormModal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {!loading && (
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            sx={{ color: 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 2, 
          pt: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
            backgroundColor: '#f5f5f5',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: 'rgba(0,0,0,.2)',
          },
          '&::-webkit-scrollbar-track': {
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
          }
        }}
      >
        <Box sx={{ minHeight: isMobile ? 'auto' : '200px' }}>
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal; 