import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { registerApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await registerApi({ username: form.username, email: form.email, fullName: form.fullName, password: form.password });
      login(res);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Card sx={{ width: 400, maxWidth: '90%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Register</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Username" margin="normal" value={form.username} onChange={update('username')} required />
            <TextField fullWidth label="Email" type="email" margin="normal" value={form.email} onChange={update('email')} required />
            <TextField fullWidth label="Full Name" margin="normal" value={form.fullName} onChange={update('fullName')} />
            <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={update('password')} required slotProps={{ htmlInput: { minLength: 6 } }} />
            <TextField fullWidth label="Confirm Password" type="password" margin="normal" value={form.confirmPassword} onChange={update('confirmPassword')} required />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 2 }}>Register</Button>
          </form>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account? <Link component={RouterLink} to="/login">Login</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
