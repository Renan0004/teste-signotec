import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FormModal = ({ open, onClose, title, children, maxWidth = 'sm' }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '50vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {title}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent 
        dividers
        sx={{
          p: 3,
          overflow: 'auto'
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default FormModal; 