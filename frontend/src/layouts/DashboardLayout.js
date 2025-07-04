import React, { useEffect } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
    Button,
    Stack,
    Container,
    Paper,
    Avatar,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Work as WorkIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { Link as RouterLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const drawerWidth = 240;

const DashboardLayout = () => {
    const [open, setOpen] = React.useState(true);
    const { logout, user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (isMobile) {
            setOpen(false);
        }
    }, [isMobile]);

    // Mostra tela de carregamento enquanto verifica autenticação
    if (loading) {
        return <LoadingScreen />;
    }

    // Proteção de rota: se não autenticado, redireciona para login
    if (!isAuthenticated && !loading) {
        return <Navigate to="/auth/login" replace />;
    }

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth/login', { replace: true });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            enqueueSnackbar('Não foi possível fazer logout. Por favor, tente novamente.', {
                variant: 'error',
                autoHideDuration: 3000
            });
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <AppBar 
                position="fixed" 
                color="inherit"
                elevation={2}
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)',
                    ...(open && !isMobile && { width: `calc(100% - ${drawerWidth}px)` }),
                    ml: open && !isMobile ? `${drawerWidth}px` : 0,
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    })
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 72 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton
                            color="primary"
                            aria-label="toggle drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 1 }}
                        >
                            {open ? <ChevronLeftIcon /> : <MenuIcon />}
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight={700}>
                            SignoTech
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {user && (
                            <>
                                <Tooltip title={user.name || user.email} arrow>
                                    <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                                        {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : '?')}
                                    </Avatar>
                                </Tooltip>
                                <Typography 
                                    variant="subtitle1" 
                                    color="text.primary" 
                                    fontWeight={600} 
                                    sx={{ 
                                        display: { xs: 'none', sm: 'block' },
                                        maxWidth: 200,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {user.name || user.email}
                                </Typography>
                            </>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ 
                                fontWeight: 700, 
                                borderRadius: 2, 
                                boxShadow: 'none', 
                                ml: 1,
                                '&:hover': {
                                    boxShadow: 'none',
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            Sair
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>
            
            <Drawer
                variant={isMobile ? "temporary" : "persistent"}
                open={open}
                onClose={isMobile ? handleDrawerToggle : undefined}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        borderRight: '1px solid #e3e3e3',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        })
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', p: 2 }}>
                    <List>
                        <ListItem 
                            button 
                            component={RouterLink} 
                            to="/dashboard/jobs"
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                    bgcolor: 'rgba(33, 150, 243, 0.08)'
                                }
                            }}
                        >
                            <ListItemIcon>
                                <WorkIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Vagas" 
                                primaryTypographyProps={{
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            />
                        </ListItem>
                        
                        <ListItem 
                            button 
                            component={RouterLink} 
                            to="/dashboard/candidates"
                            sx={{
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: 'rgba(33, 150, 243, 0.08)'
                                }
                            }}
                        >
                            <ListItemIcon>
                                <PersonIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Candidatos" 
                                primaryTypographyProps={{
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            />
                        </ListItem>
                    </List>
                    <Divider sx={{ my: 2 }} />
                </Box>
            </Drawer>
            
            <Box component="main" sx={{ 
                flexGrow: 1, 
                p: { xs: 1, sm: 3 },
                width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
                ml: { md: open ? `${drawerWidth}px` : 0 },
                transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                })
            }}>
                <Toolbar />
                <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 2 } }}>
                    <Paper 
                        sx={{ 
                            p: { xs: 1.5, sm: 3 }, 
                            borderRadius: 3, 
                            boxShadow: '0 2px 8px 0 rgba(33,150,243,0.07)', 
                            background: 'rgba(255,255,255,0.97)',
                            minHeight: 'calc(100vh - 200px)'
                        }}
                    >
                        <Outlet />
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default DashboardLayout; 