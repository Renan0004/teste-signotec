import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../components/Login';
import Register from '../components/Register';
import JobList from '../components/JobList';
import CandidateList from '../components/CandidateList';
import NotFound from '../pages/NotFound';
import { AuthProvider } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const AppLayout = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
        ],
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            path: '',
            element: <Navigate to="jobs" replace />,
          },
          {
            path: 'jobs',
            element: <JobList />,
          },
          {
            path: 'candidates',
            element: <CandidateList />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router; 