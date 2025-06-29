import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  styled
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Estilização personalizada para o modal
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

// Título do modal estilizado
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

/**
 * Componente de formulário modal reutilizável
 * 
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.open - Estado de abertura do modal
 * @param {function} props.onClose - Função para fechar o modal
 * @param {string} props.title - Título do modal
 * @param {function} props.onSubmit - Função para submeter o formulário
 * @param {boolean} props.loading - Estado de carregamento
 * @param {React.ReactNode} props.children - Conteúdo do modal
 * @param {string} props.submitText - Texto do botão de submissão
 * @param {string} props.cancelText - Texto do botão de cancelamento
 * @param {string} props.maxWidth - Largura máxima do modal
 */
const FormModal = ({
  open,
  onClose,
  title,
  onSubmit,
  loading = false,
  children,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  maxWidth = 'md'
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <StyledDialogTitle>
        <Typography variant="h6">{title}</Typography>
        {!loading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </StyledDialogTitle>
      
      <DialogContent dividers>
        <Box component="form" noValidate onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}>
          {children}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={loading}
          variant="contained"
          color="primary"
          type="submit"
        >
          {loading ? 'Processando...' : submitText}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default FormModal; 