import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Button, Grid, Paper, 
  Divider, Card, CardContent, CardMedia, CardActions,
  Avatar, Fade, Zoom, useMediaQuery, useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockIcon from '@mui/icons-material/Lock';
import DevicesIcon from '@mui/icons-material/Devices';

const HomePage: React.FC = () => {
  const { lists, loadLists, isLoading } = useTodo();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);

  useEffect(() => {
    loadLists();
    
    // Trigger hero animation after component mounts
    const timer = setTimeout(() => {
      setHeroAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [loadLists]);

  return (
    <>
      {/* Modern Hero Section - Inspired by UniFi's "Ocean of 6 GHz Spectrum" */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #001E3C 0%, #0559C9 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
        }}
      >
        {/* Background decoration elements */}
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '-5%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75,150,255,0.15) 0%, rgba(0,0,0,0) 70%)',
          opacity: heroAnimationComplete ? 1 : 0.5,
          transition: 'opacity 0.5s ease-in-out',
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75,150,255,0.1) 0%, rgba(0,0,0,0) 70%)',
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Box mb={2} display="flex" alignItems="center">
                    <img 
                      src={`${process.env.PUBLIC_URL}/logo512.png`} 
                      alt="Logo" 
                      style={{ 
                        width: 48, 
                        height: 48, 
                        marginRight: 16, 
                        borderRadius: '50%',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                      }} 
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        letterSpacing: '0.5px',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      TaskSync
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h1" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                      background: 'linear-gradient(90deg, #FFFFFF 0%, #B7D4FF 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    Real-Time Collaborative Task Management
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 400, 
                      mb: 4, 
                      opacity: 0.85,
                      maxWidth: '90%',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      lineHeight: 1.5
                    }}
                  >
                    Synchronize your team's productivity with our powerful, real-time to-do list platform that adapts to your workflow.
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      mt: 5
                    }}
                  >
                    <Button
                      component={Link}
                      to="/create"
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 1.5, 
                        px: 4,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, #0559C9 0%, #0078FF 100%)',
                        boxShadow: '0 8px 16px rgba(5, 89, 201, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 20px rgba(5, 89, 201, 0.4)',
                          background: 'linear-gradient(90deg, #0451B5 0%, #0066DB 100%)',
                        }
                      }}
                    >
                      Create New List
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Zoom in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 240, md: 320 },
                    height: { xs: 240, md: 320 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Outer glowing orbit */}
                  <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 0 60px rgba(75,150,255,0.5)',
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' }
                    }
                  }} />
                  
                  {/* Inner orbit */}
                  <Box sx={{
                    position: 'absolute',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    animation: 'rotate-reverse 15s linear infinite',
                    '@keyframes rotate-reverse': {
                      from: { transform: 'rotate(360deg)' },
                      to: { transform: 'rotate(0deg)' }
                    }
                  }} />
                  
                  {/* Central sphere */}
                  <Box sx={{
                    width: '50%',
                    height: '50%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(75,150,255,0.5) 60%, rgba(5,89,201,0.3) 100%)',
                    boxShadow: '0 0 40px rgba(75,150,255,0.8), inset 0 0 20px rgba(255,255,255,0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'pulse 3s ease-in-out infinite alternate',
                    '@keyframes pulse': {
                      from: { boxShadow: '0 0 40px rgba(75,150,255,0.8), inset 0 0 20px rgba(255,255,255,0.4)' },
                      to: { boxShadow: '0 0 60px rgba(75,150,255,0.9), inset 0 0 30px rgba(255,255,255,0.6)' }
                    }
                  }} />
                  
                  {/* Orbit particles */}
                  <Box sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '15%',
                    width: '8%',
                    height: '8%',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                    animation: 'orbit1 8s linear infinite',
                    '@keyframes orbit1': {
                      from: { transform: 'rotate(0deg) translateX(140px)' },
                      to: { transform: 'rotate(360deg) translateX(140px)' }
                    }
                  }} />
                  
                  <Box sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '40%',
                    width: '5%',
                    height: '5%',
                    borderRadius: '50%',
                    background: '#66E5F7',
                    boxShadow: '0 0 15px rgba(102,229,247,0.8)',
                    animation: 'orbit2 12s linear infinite',
                    '@keyframes orbit2': {
                      from: { transform: 'rotate(180deg) translateX(100px)' },
                      to: { transform: 'rotate(-180deg) translateX(100px)' }
                    }
                  }} />
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>
    
      
      {/* Combined Features Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #fff 0%, rgba(5, 89, 201, 0.03) 100%)'
      }}>
        <Container maxWidth="lg">      
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 3,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #172B4D 30%, #0559C9 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powerful Features, Simple Experience
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto', 
                color: 'text.secondary',
                fontWeight: 400,
                mb: 6
              }}
            >
              Everything you need to manage tasks efficiently and collaborate seamlessly
            </Typography>
          </Box>
        
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{ 
                    height: 180, 
                    background: 'linear-gradient(135deg, #4B96FF 0%, #0559C9 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 64, color: '#fff' }} />
                </CardMedia>
                <CardContent sx={{ p: 3 }}>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    Track Completion
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Easily mark tasks as completed, filter by status, and keep track of your team's progress in real-time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{ 
                    height: 180, 
                    background: 'linear-gradient(135deg, #0559C9 0%, #003B8E 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <GroupIcon sx={{ fontSize: 64, color: '#fff' }} />
                </CardMedia>
                <CardContent sx={{ p: 3 }}>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    Real-Time Collaboration
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Work together seamlessly with your team members. All changes appear instantly for everyone connected to the list.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{ 
                    height: 180, 
                    background: 'linear-gradient(135deg, #003B8E 0%, #001E3C 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <DragIndicatorIcon sx={{ fontSize: 64, color: '#fff' }} />
                </CardMedia>
                <CardContent sx={{ p: 3 }}>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    Drag & Drop Reordering
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Easily prioritize tasks by dragging and dropping them into your preferred order. Changes sync instantly across devices.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={5} mt={6}>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(5, 89, 201, 0.1)',
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  <DevicesIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Cross-Device Sync
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access your tasks from any device with real-time synchronization
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(5, 89, 201, 0.1)',
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  <LockIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Secure Sharing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share lists securely with specific team members or make them public
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(5, 89, 201, 0.1)',
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  <CheckCircleIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Smart Filtering
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter tasks by status, priority, or custom tags for better organization
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(5, 89, 201, 0.1)',
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  <GroupIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Team Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assign tasks to team members and track progress collectively
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Divider />
      
      {/* Your Lists section - Modernized */}
      <Box 
        sx={{
          background: 'linear-gradient(180deg, #fff 0%, rgba(5, 89, 201, 0.02) 100%)',
          py: 10
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 2, 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #172B4D 30%, #0559C9 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your To-Do Lists
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 6,
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            Access and manage all your task lists in one place
          </Typography>

          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={40} thickness={4} />
              <Typography sx={{ mt: 2 }}>Loading your lists...</Typography>
            </Box>
          ) : lists.length > 0 ? (
            <Grid container spacing={4}>
              {lists.map(list => (
                <Grid item xs={12} sm={6} md={4} key={list.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fbff 100%)',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
                      }
                    }}
                    component={Link}
                    to={`/list/${list.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          background: 'linear-gradient(135deg, #0559C9 0%, #0078FF 100%)', 
                          width: 48, 
                          height: 48,
                          mr: 2,
                          boxShadow: '0 4px 8px rgba(5, 89, 201, 0.2)'
                        }}
                      >
                        <ListIcon />
                      </Avatar>
                      <Typography variant="h6" component="h3" noWrap sx={{ fontWeight: 600 }}>
                        {list.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                      Created: {new Date(list.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="medium"
                      sx={{ 
                        mt: 'auto', 
                        alignSelf: 'flex-start',
                        borderRadius: '10px',
                        background: 'linear-gradient(90deg, #0559C9 0%, #0078FF 100%)',
                        py: 1,
                        px: 3,
                        boxShadow: '0 4px 8px rgba(5, 89, 201, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 12px rgba(5, 89, 201, 0.3)',
                          background: 'linear-gradient(90deg, #0451B5 0%, #0066DB 100%)',
                        }
                      }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Open List
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                bgcolor: 'rgba(255,255,255,0.9)', 
                textAlign: 'center', 
                borderRadius: '24px',
                maxWidth: 700,
                mx: 'auto',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EBF2FF 0%, #F9FBFF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mx: 'auto',
                  border: '1px solid rgba(5, 89, 201, 0.1)',
                }}
              >
                <img 
                  src={`${process.env.PUBLIC_URL}/logo512.png`} 
                  alt="Logo" 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    opacity: 0.8 
                  }} 
                />
              </Box>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                You don't have any lists yet
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Create your first list to start organizing tasks and collaborating with your team
              </Typography>
              <Button
                component={Link}
                to="/create"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #0559C9 0%, #0078FF 100%)',
                  boxShadow: '0 8px 16px rgba(5, 89, 201, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 20px rgba(5, 89, 201, 0.3)',
                    background: 'linear-gradient(90deg, #0451B5 0%, #0066DB 100%)',
                  }
                }}
              >
                Create Your First List
              </Button>
            </Paper>
          )}
        </Container>
      </Box>
      
      {/* Get Started section - Modernized */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #001E3C 0%, #0559C9 100%)',
          color: 'white', 
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: '0',
          right: '5%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75,150,255,0.1) 0%, rgba(0,0,0,0) 70%)',
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: '0',
          left: '5%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(75,150,255,0.08) 0%, rgba(0,0,0,0) 70%)',
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid 
            container 
            spacing={{ xs: 6, md: 8 }} 
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item xs={12} md={5}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      fontSize: { xs: '2rem', md: '2.75rem' },
                      lineHeight: 1.2,
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    Get Started with TaskSync
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 4, 
                      fontSize: '1.1rem', 
                      opacity: 0.9, 
                      lineHeight: 1.6,
                      maxWidth: '90%'
                    }}
                  >
                    Start by creating a new list, add your tasks, and share the unique URL with your team members for seamless collaboration.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/create" 
                    size="large"
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, #00A3E0 0%, #00C4FF 100%)',
                      boxShadow: '0 8px 16px rgba(0, 193, 222, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 20px rgba(0, 193, 222, 0.4)',
                        background: 'linear-gradient(90deg, #0097D0 0%, #00B8F0 100%)',
                      }
                    }}
                  >
                    Create New List
                  </Button>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)'
                  }}
                >
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 0,
                      opacity: 0.4,
                      background: 'radial-gradient(circle at center, rgba(75,150,255,0.2) 0%, rgba(0,0,0,0) 70%)',
                    }}
                  />
                  <Box position="relative" zIndex={1}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                      flexDirection="column"
                      textAlign="center"
                      py={4}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 4,
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <img 
                          src={`${process.env.PUBLIC_URL}/logo512.png`} 
                          alt="Logo" 
                          style={{ 
                            width: 80, 
                            height: 80, 
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
                          }} 
                        />
                      </Box>
                      <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
                        TaskSync Pro
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, fontSize: '1.1rem' }}>
                        Upgrade to Pro for advanced features, unlimited lists, and priority support
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="inherit"
                        sx={{ 
                          py: 1.5,
                          px: 4,
                          borderRadius: '12px',
                          borderWidth: '2px',
                          borderColor: 'rgba(255,255,255,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            transform: 'translateY(-3px)',
                          }
                        }}
                      >
                        Explore Pro Features
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

// Helper component for feature items
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(5, 89, 201, 0.1)',
          color: 'primary.main',
          mb: 3,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Grid>
);

// Chip component for feature tags
interface ChipProps {
  label: string;
}

const Chip: React.FC<ChipProps> = ({ label }) => (
  <Box 
    component="span" 
    sx={{ 
      px: 1.5, 
      py: 0.5, 
      borderRadius: 4, 
      backgroundColor: 'rgba(5, 89, 201, 0.1)', 
      color: 'primary.main',
      fontSize: '0.75rem',
      fontWeight: 500,
      display: 'inline-block',
    }}
  >
    {label}
  </Box>
);

// Loading indicator
interface CircularProgressProps {
  size: number;
  thickness: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ size, thickness }) => (
  <Box
    sx={{ 
      position: 'relative',
      display: 'inline-block',
      width: size,
      height: size,
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: `${thickness}px solid rgba(5, 89, 201, 0.1)`,
        borderTopColor: 'primary.main',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }}
    />
  </Box>
);

export default HomePage;
