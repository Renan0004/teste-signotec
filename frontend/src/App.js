import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Tab,
  Tabs,
  Button,
  AppBar,
  Toolbar,
  Typography,
  IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import CandidateList from './components/CandidateList';
import CandidateForm from './components/CandidateForm';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [tab, setTab] = useState(0);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
  };

  const handleRegister = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleJobEdit = (job) => {
    setJobToEdit(job);
    setShowJobForm(true);
  };

  const handleCandidateEdit = (candidate) => {
    setCandidateToEdit(candidate);
    setShowCandidateForm(true);
  };

  const handleJobSave = () => {
    setShowJobForm(false);
    setJobToEdit(null);
  };

  const handleCandidateSave = () => {
    setShowCandidateForm(false);
    setCandidateToEdit(null);
  };

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onLoginClick={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onRegisterClick={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Vagas e Candidatos
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Olá, {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="VAGAS" />
            <Tab label="CANDIDATOS" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            {!showJobForm ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowJobForm(true)}
                  sx={{ mb: 2 }}
                >
                  Nova Vaga
                </Button>
                <JobList onEdit={handleJobEdit} />
              </>
            ) : (
              <JobForm
                jobToEdit={jobToEdit}
                onSave={handleJobSave}
                onCancel={() => {
                  setShowJobForm(false);
                  setJobToEdit(null);
                }}
              />
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {!showCandidateForm ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowCandidateForm(true)}
                  sx={{ mb: 2 }}
                >
                  Novo Candidato
                </Button>
                <CandidateList onEdit={handleCandidateEdit} />
              </>
            ) : (
              <CandidateForm
                candidateToEdit={candidateToEdit}
                onSave={handleCandidateSave}
                onCancel={() => {
                  setShowCandidateForm(false);
                  setCandidateToEdit(null);
                }}
              />
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
