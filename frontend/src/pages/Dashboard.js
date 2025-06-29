import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  PauseCircle as PauseIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { jobService, candidateService } from '../services/api';

// Componente de estatística
const StatCard = ({ title, value, subtitle, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: 80, 
          height: 80, 
          background: `linear-gradient(45deg, transparent 50%, ${alpha(color, 0.1)} 50%)`,
          zIndex: 0
        }} 
      />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    recentJobs: [],
    recentCandidates: [],
    popularJobs: []
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, teríamos um endpoint específico para o dashboard
      // Aqui estamos simulando com múltiplas chamadas
      
      let recentJobs = [];
      let totalJobs = 0;
      let recentCandidates = [];
      let totalCandidates = 0;
      let activeJobs = 0;
      let popularJobs = [];
      
      try {
        // Buscar vagas recentes
        const jobsResponse = await jobService.getAll(1, 5, {}, { sort_by: 'created_at', sort_direction: 'desc' });
        recentJobs = jobsResponse.data.data;
        totalJobs = jobsResponse.data.meta.total;
        
        // Buscar candidatos recentes
        const candidatesResponse = await candidateService.getAll(1, 5, {}, { sort_by: 'created_at', sort_direction: 'desc' });
        recentCandidates = candidatesResponse.data.data;
        totalCandidates = candidatesResponse.data.meta.total;
        
        // Contar vagas ativas
        const activeJobsResponse = await jobService.getAll(1, 1, { active: true });
        activeJobs = activeJobsResponse.data.meta.total;
        
        // Buscar vagas populares (com mais candidatos)
        const popularJobsResponse = await jobService.getAll(1, 5, {}, { sort_by: 'candidates_count', sort_direction: 'desc' });
        popularJobs = popularJobsResponse.data.data;
      } catch (error) {
        console.error('Erro ao buscar dados da API, usando dados simulados:', error);
        
        // Usar dados simulados quando a API falhar
        recentJobs = [
          { id: 1, title: 'Desenvolvedor Frontend', type: 'CLT', created_at: '2023-06-25', active: true, candidates_count: 3 },
          { id: 2, title: 'Desenvolvedor Backend', type: 'PJ', created_at: '2023-06-24', active: true, candidates_count: 5 },
          { id: 3, title: 'Designer UI/UX', type: 'Freelancer', created_at: '2023-06-23', active: false, candidates_count: 2 }
        ];
        totalJobs = recentJobs.length;
        
        recentCandidates = [
          { id: 1, name: 'João Silva', email: 'joao@example.com', created_at: '2023-06-25', jobs_count: 2 },
          { id: 2, name: 'Maria Oliveira', email: 'maria@example.com', created_at: '2023-06-24', jobs_count: 3 },
          { id: 3, name: 'Pedro Santos', email: 'pedro@example.com', created_at: '2023-06-23', jobs_count: 1 }
        ];
        totalCandidates = recentCandidates.length;
        
        activeJobs = 2;
        
        popularJobs = [...recentJobs].sort((a, b) => b.candidates_count - a.candidates_count);
      }
      
      // Calcular total de inscrições (simplificado)
      const totalApplications = popularJobs.reduce((sum, job) => sum + (job.candidates_count || 0), 0);
      
      setStats({
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        recentJobs,
        recentCandidates,
        popularJobs
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <Layout>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visão geral do sistema de gerenciamento de vagas e candidatos
          </Typography>
        </div>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>
      
      {loading ? (
        <LinearProgress sx={{ mb: 4 }} />
      ) : (
        <>
          {/* Cards de estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Vagas"
                value={stats.totalJobs}
                subtitle={`${stats.activeJobs} vagas ativas`}
                icon={<WorkIcon />}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Candidatos"
                value={stats.totalCandidates}
                subtitle="Total de candidatos cadastrados"
                icon={<PersonIcon />}
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Inscrições"
                value={stats.totalApplications}
                subtitle="Total de inscrições em vagas"
                icon={<AssignmentIcon />}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Vagas Pausadas"
                value={stats.totalJobs - stats.activeJobs}
                subtitle="Vagas temporariamente inativas"
                icon={<PauseIcon />}
                color={theme.palette.warning.main}
              />
            </Grid>
          </Grid>

          {/* Listas */}
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardHeader 
                  title={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Vagas Recentes</Typography>
                    </span>
                  }
                  action={
                    <Button 
                      component={Link} 
                      to="/jobs" 
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      color="primary"
                    >
                      Ver todas
                    </Button>
                  }
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <List>
                    {stats.recentJobs.length > 0 ? (
                      stats.recentJobs.map((job, index) => (
                        <React.Fragment key={job.id}>
                          <ListItem 
                            sx={{ 
                              py: 1.5,
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                            secondaryAction={
                              <Tooltip title="Mais opções">
                                <IconButton edge="end" size="small">
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {job.title}
                                </Typography>
                              }
                              secondary={
                                <span style={{ display: 'flex', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                                  <Chip 
                                    label={job.type} 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                  />
                                  <Chip 
                                    label={job.active ? 'Ativa' : 'Pausada'} 
                                    size="small" 
                                    color={job.active ? 'success' : 'error'}
                                    variant="outlined"
                                  />
                                  <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {job.candidates_count || 0} candidatos
                                    </Typography>
                                  </span>
                                </span>
                              }
                            />
                          </ListItem>
                          {index < stats.recentJobs.length - 1 && <Divider variant="middle" />}
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary="Nenhuma vaga cadastrada" 
                          secondary="Clique em 'Nova Vaga' para adicionar"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardHeader 
                  title={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6">Candidatos Recentes</Typography>
                    </span>
                  }
                  action={
                    <Button 
                      component={Link} 
                      to="/candidates" 
                      size="small" 
                      endIcon={<ArrowForwardIcon />}
                      color="primary"
                    >
                      Ver todos
                    </Button>
                  }
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <List>
                    {stats.recentCandidates.length > 0 ? (
                      stats.recentCandidates.map((candidate, index) => (
                        <React.Fragment key={candidate.id}>
                          <ListItem 
                            sx={{ 
                              py: 1.5,
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                            secondaryAction={
                              <Tooltip title="Mais opções">
                                <IconButton edge="end" size="small">
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` 
                              }}
                            >
                              {candidate.name.charAt(0)}
                            </Avatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {candidate.name}
                                </Typography>
                              }
                              secondary={
                                <span style={{ display: 'flex', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <WorkIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {candidate.jobs_count || 0} vagas
                                  </Typography>
                                  {candidate.email && (
                                    <Typography variant="body2" color="text.secondary">
                                      {candidate.email}
                                    </Typography>
                                  )}
                                </span>
                              }
                            />
                          </ListItem>
                          {index < stats.recentCandidates.length - 1 && <Divider variant="middle" />}
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary="Nenhum candidato cadastrado" 
                          secondary="Clique em 'Novo Candidato' para adicionar"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader 
                  title={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6">Vagas Populares</Typography>
                    </span>
                  }
                  subheader="Vagas com mais candidatos inscritos"
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {stats.popularJobs.length > 0 ? (
                      stats.popularJobs.map((job) => (
                        <Grid xs={12} sm={6} md={4} key={job.id}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {job.title}
                              </Typography>
                              <span style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                <Chip 
                                  label={job.type} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip 
                                  label={job.active ? 'Ativa' : 'Pausada'} 
                                  size="small" 
                                  color={job.active ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              </span>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {job.description?.substring(0, 100)}
                                {job.description?.length > 100 ? '...' : ''}
                              </Typography>
                              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip 
                                  icon={<PersonIcon />}
                                  label={`${job.candidates_count || 0} candidatos`}
                                  color="secondary"
                                  size="small"
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  {new Date(job.created_at).toLocaleDateString('pt-BR')}
                                </Typography>
                              </span>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid xs={12}>
                        <Typography variant="body1" align="center" sx={{ py: 3 }}>
                          Nenhuma vaga com candidatos inscritos
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default Dashboard; 