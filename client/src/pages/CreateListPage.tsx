import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Fade, 
  Divider, 
  useTheme, 
  useMediaQuery,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Grow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TitleIcon from '@mui/icons-material/Title';

const CreateListPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const { createNewList, isLoading } = useTodo();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a list title');
      return;
    }
    
    try {
      const newList = await createNewList(title);
      navigate(`/list/${newList.slug}`);
    } catch (err) {
      setError('Failed to create list. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: isMobile ? 4 : 8, mb: 6 }}>
      <Grow in={true} timeout={600}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: isMobile ? 3 : 5, 
            borderRadius: 2,
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
              aria-label="Back to home"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                textAlign: 'center',
                flexGrow: 1
              }}
            >
              Create New List
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 4 }} />
          
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 3 
            }}>
              <TextField
                label="List Title"
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                error={!!error}
                disabled={isLoading}
                autoFocus
                placeholder="e.g., Shopping List, Project Tasks, Travel Plan..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%',
                mt: 2,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    order: isMobile ? 2 : 1,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </Button>
                
                <Tooltip title={!title.trim() ? "Please enter a title first" : "Create your new list"}>
                  <span>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isLoading || !title.trim()}
                      startIcon={isLoading ? <CheckCircleIcon /> : <AddCircleOutlineIcon />}
                      sx={{
                        order: isMobile ? 1 : 2,
                        width: isMobile ? '100%' : 'auto',
                        px: 4,
                        py: 1.2,
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        '&:not(:disabled):hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      {isLoading ? 'Creating...' : 'Create List'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </form>
        </Paper>
      </Grow>
    </Container>
  );
};

export default CreateListPage;
