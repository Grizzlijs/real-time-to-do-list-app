import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  InputAdornment,
  IconButton,
  Alert,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Login, LockOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await login(username, password);
      if (success) {
        // Redirect to the page they tried to visit or home
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
    return (
    <Container maxWidth="sm" sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(5, 89, 201, 0.03) 0%, rgba(75, 150, 255, 0.08) 100%)',
    }}>
      <Card 
        elevation={4} 
        sx={{ 
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(5, 89, 201, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box 
            component="form" 
            onSubmit={handleLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mb: 3 
              }}
            >              <Paper 
                elevation={4} 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  boxShadow: `0 10px 20px -5px ${theme.palette.primary.main}70`,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <LockOutlined sx={{ fontSize: 36, color: '#fff' }} />
                  {/* Animated pulse effect */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                    opacity: 0,
                    backgroundColor: '#fff',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(0.95)',
                        opacity: 0.7,
                      },
                      '100%': {
                        transform: 'scale(1.8)',
                        opacity: 0,
                      },
                    },
                  }} />
                </Box>
              </Paper>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                Welcome to TaskSync
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Login to access your real-time to-do lists
              </Typography>
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { alignItems: 'center' } 
                }}
              >
                {error}
              </Alert>
            )}            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: theme.palette.primary.main, opacity: 0.7 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 10px rgba(5, 89, 201, 0.15)',
                  }
                }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: theme.palette.primary.main, opacity: 0.7 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </Box>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 10px rgba(5, 89, 201, 0.15)',
                  }
                }
              }}
            />            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              startIcon={<Login />}
              sx={{
                py: 1.8,
                mt: 2,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 10px 20px -5px ${theme.palette.primary.main}50`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 14px 28px -10px ${theme.palette.primary.main}70`,
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                }
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            
            {/* Version info */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mt: 3, 
                opacity: 0.7, 
                textAlign: 'center',
                display: 'block'
              }}
            >
              TaskSync • Version 1.0.0
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
