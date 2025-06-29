import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Button,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  styled,
  alpha,
  Tooltip,
  Badge,
  ListSubheader
} from '@mui/material';
import {
  Menu as MenuIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

// Estilização personalizada para o drawer
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows[3],
    borderRight: 'none',
  },
}));

// Estilização para o cabeçalho do drawer
const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  minHeight: 64,
}));

// Estilização para o item de menu ativo
const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/login');
  };

  // Menu de navegação
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Vagas', icon: <WorkIcon />, path: '/jobs' },
    { text: 'Candidatos', icon: <PersonIcon />, path: '/candidates' },
  ];

  // Verificar se o item de menu está ativo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Componente de menu lateral
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DrawerHeader>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <WorkIcon sx={{ mr: 1 }} /> SignoTech
        </Typography>
      </DrawerHeader>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1 }}>
        <ListSubheader sx={{ bgcolor: 'transparent' }}>
          Menu Principal
        </ListSubheader>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {isActive(item.path) && (
                <ChevronRightIcon color="primary" fontSize="small" />
              )}
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} SignoTech
        </Typography>
      </Box>
    </Box>
  );

  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
            Sistema de Gerenciamento de Vagas
          </Typography>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Notificações">
                <IconButton color="inherit" size="large">
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Configurações">
                <IconButton color="inherit" size="large">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Box sx={{ ml: 2 }}>
                <Tooltip title="Perfil do usuário">
                  <IconButton
                    size="large"
                    aria-label="conta do usuário"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 40,
                        height: 40
                      }}
                    >
                      {user?.name?.charAt(0) || <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {user?.name || 'Usuário'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || 'usuario@exemplo.com'}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Perfil" />
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Sair" />
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          ) : (
            <Button 
              color="primary" 
              variant="contained"
              component={Link} 
              to="/login"
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 