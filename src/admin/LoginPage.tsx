/**
 * Admin login page.
 *
 * Password is verified server-side via /api/auth. The password is never
 * stored in the frontend JS bundle. On success, the server-issued token
 * is stored in sessionStorage (cleared when the browser tab closes) and
 * the user is redirected to the dashboard.
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
  CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { setAuthToken, isAuthenticated } from './adminStorage';

/**
 * Login form with password input, show/hide toggle, and error feedback.
 * Submits password to /api/auth for server-side verification.
 */
function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // If already authenticated, redirect to dashboard.
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(data.error || '密码错误，请重试。');
        setPassword('');
      }
    } catch {
      setError('网络错误，请检查连接后重试。');
    } finally {
      setLoading(false);
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
            管理后台
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            请输入密码以进入管理后台
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
              label="密码"
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
                      aria-label="显示/隐藏密码"
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
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
            </Button>
          </Box>

          <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
            <Button href="/" size="small" color="inherit">
              ← 返回网站
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
