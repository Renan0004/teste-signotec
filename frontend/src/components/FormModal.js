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
  CircularProgress,
  Slide,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      alignItems: 'flex-end'
    }
  },
  '& .MuiDialog-paper': {
    margin: 0,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    maxHeight: `calc(100% - ${theme.spacing(4)})`,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      width: '100%',
      maxWidth: '100% !important',
      borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
      maxHeight: '90vh'
    }
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)'
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.background.default
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: '4px'
    }
  }
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2)
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return <Slide direction={isMobile ? "up" : "down"} ref={ref} {...props} />;
});

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <StyledDialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      TransitionComponent={Transition}
      keepMounted
      PaperProps={{
        elevation: 8,
        sx: {
          maxWidth: theme.breakpoints.values[maxWidth],
          transition: theme.transitions.create(['transform', 'opacity'], {
            duration: theme.transitions.duration.standard,
          })
        }
      }}
    >
      <Fade in={open}>
        <form onSubmit={handleSubmit}>
          <StyledDialogTitle>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {title}
              </Typography>
              {!loading && (
                <IconButton
                  edge="end"
                  onClick={onClose}
                  aria-label="close"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'text.primary'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </StyledDialogTitle>

          <StyledDialogContent>
            <Box sx={{ minHeight: isMobile ? 'auto' : '200px' }}>
              {children}
            </Box>
          </StyledDialogContent>

          {!hideActions && (
            <StyledDialogActions>
              <Button
                onClick={onClose}
                disabled={loading}
                color="inherit"
                sx={{
                  minWidth: 100,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  minWidth: 100,
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  submitLabel
                )}
              </Button>
            </StyledDialogActions>
          )}
        </form>
      </Fade>
    </StyledDialog>
  );
};

export default FormModal; 