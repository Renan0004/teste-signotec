import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={64} thickness={4} />
      <Typography
        variant="h6"
        sx={{
          mt: 3,
          fontWeight: 600,
          color: 'text.secondary',
        }}
      >
        Carregando...
      </Typography>
    </Box>
  );
};

export default LoadingScreen; 