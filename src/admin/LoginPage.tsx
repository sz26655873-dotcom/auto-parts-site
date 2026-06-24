/**
 * Admin login page.
 *
 * Simple password-based authentication. The password is compared against
 * the hardcoded ADMIN_PASSWORD constant. On success, the auth flag is
 * stored in sessionStorage (cleared when the browser tab closes) and the
 * user is redirected to the dashboard.
 *
 * If the user is already authenticated, they are redirected to the
 * dashboard automatically.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { ADMIN_PASSWORD, setAuthenticated, isAuthenticated } from './adminStorage';

/**
 * Login form with password input, show/hide toggle, and error feedback.
 */
function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // If already authenticated, redirect to dashboard.
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleTogglePassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A2342 0%, #061629 60%, #030B15 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              mb: 2,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: '#fff',
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}>
            Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your password to access the management dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              variant="outlined"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, py: 1.5 }}
            >
              Login
            </Button>
          </Box>

          <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
            <Button href="/" size="small" color="inherit">
              ← Back to Site
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
