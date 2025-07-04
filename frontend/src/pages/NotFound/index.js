import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Página não encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        A página que você está procurando não existe ou foi removida.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        startIcon={<HomeIcon />}
        sx={{ mt: 2 }}
      >
        Voltar para a página inicial
      </Button>
    </Box>
  );
};

export default NotFound; 