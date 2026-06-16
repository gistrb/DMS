import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Users from './pages/Users';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              <Route path="/" element={
                <ProtectedRoute permission="documents.view">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute permission="documents.view">
                  <Documents />
                </ProtectedRoute>
              } />
              <Route path="/documents/:id" element={
                <ProtectedRoute permission="documents.view">
                  <DocumentDetail />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute role="Admin">
                  <Users />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
