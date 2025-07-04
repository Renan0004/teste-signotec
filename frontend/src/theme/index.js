import { createTheme } from '@mui/material/styles';

// Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff'
    },
    error: {
      main: '#e53935',
      light: '#ff6f60',
      dark: '#ab000d',
      contrastText: '#fff'
    },
    warning: {
      main: '#ffa726',
      light: '#ffd95b',
      dark: '#c77800',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      main: '#0288d1',
      light: '#5eb8ff',
      dark: '#005b9f',
      contrastText: '#fff'
    },
    success: {
      main: '#43a047',
      light: '#76d275',
      dark: '#00701a',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#334155',
      secondary: '#64748b'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)',
          backdropFilter: 'blur(2px)'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined'
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#f8fafc'
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              boxShadow: '0 0 0 2px rgba(25,118,210,0.2)'
            }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f1f5f9',
          '& .MuiTableCell-root': {
            color: '#334155',
            fontWeight: 600,
            fontSize: '0.875rem'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
        }
      }
    }
  }
});

export default theme; 