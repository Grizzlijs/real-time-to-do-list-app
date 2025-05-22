import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Button, Grid, Paper, 
  Divider, Card, CardContent, CardMedia,
  Avatar, Fade, Zoom, useTheme, // Uncommented useTheme
  Modal, IconButton, Link as MuiLink, CircularProgress // CircularProgress is imported here
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
// import LockIcon from '@mui/icons-material/Lock'; // Removed unused LockIcon
// import DevicesIcon from '@mui/icons-material/Devices'; // Removed unused DevicesIcon
import CloseIcon from '@mui/icons-material/Close';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';

const HomePage: React.FC = () => {
  const { lists, isLoading } = useTodo();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme(); // theme is used in sx props, so we keep it but disable the warning if not directly called
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [lidRotation, setLidRotation] = useState(0);
  
  const handleOpenEasterEgg = () => {
    setIsEasterEggOpen(true);
    // Reset states
    setIsGiftOpen(false);
    setLidRotation(0);
    
    // Start lid opening animation
    const interval = setInterval(() => {
      setLidRotation(prev => {
        if (prev < 70) return prev + 5;
        clearInterval(interval);
        return 70;
      });
    }, 100);
    
    // Trigger gift opening after animation
    setTimeout(() => setIsGiftOpen(true), 2000);
  };

  const handleCloseEasterEgg = () => {
    setIsEasterEggOpen(false);
    setIsGiftOpen(false);
    setLidRotation(0);
  };

  useEffect(() => {
    // Trigger hero animation after component mounts
    const timer = setTimeout(() => {
      setHeroAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
                      fontSize: { xs: '2.5rem', md: '3.2rem' },
                      lineHeight: 1.2,
                      background: 'linear-gradient(90deg, #FFFFFF 0%, #B7D4FF 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    Smart Task Management with Real-Time Chat
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
                    Create specialized task lists, collaborate in real-time, and chat with your team - all in one powerful platform. Perfect for work, food tracking, and personal organization.
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
                  <ListIcon sx={{ fontSize: 64, color: '#fff' }} />
              </CardMedia>
              <CardContent sx={{ p: 3 }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  Specialized Task Types
                </Typography>
                  <Typography variant="body1" color="text.secondary">
                  Create different types of tasks including basic tasks, work tasks with deadlines, and food tasks with nutritional information.
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
                  Per-List Chat & Collaboration
                </Typography>
                  <Typography variant="body1" color="text.secondary">
                  Chat with team members viewing the same list, see who's online, and collaborate in real-time with instant updates.
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
                  Smart Task Organization
                </Typography>
                  <Typography variant="body1" color="text.secondary">
                  Drag and drop tasks to reorder, create subtasks, and convert between task types. Filter by status and manage multiple lists.
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
                  <CodeIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Markdown Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add rich text formatting to task descriptions with Markdown support
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
                  <StorageIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Data Persistence
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All your tasks are securely stored in PostgreSQL database
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
                  Task Completion
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track progress with completion status and filter views
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
                  User Customization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set your display name and identify users with unique colors
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
          position: 'relative',
          background: 'linear-gradient(180deg, #fff 0%, rgba(237, 246, 255, 0.5) 100%)',
          py: { xs: 8, md: 12 },
          overflow: 'hidden'
        }}
      >
        {/* Decorative background elements */}
        <Box 
          sx={{
            position: 'absolute',
            top: '10%',
            left: '-10%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5, 89, 201, 0.03) 0%, rgba(5, 89, 201, 0) 70%)',
            zIndex: 0
          }}
        />
        
        <Box 
          sx={{
            position: 'absolute',
            bottom: '5%',
            right: '-5%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5, 89, 201, 0.04) 0%, rgba(5, 89, 201, 0) 70%)',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 7 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          sx={{ 
                position: 'relative',
                display: 'inline-block',
            textAlign: 'center', 
                mb: 1, 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #172B4D 30%, #0559C9 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'linear-gradient(90deg, #0559C9 0%, #78A9FF 100%)',
                }
          }}
        >
          Your To-Do Lists
        </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                mt: 3,
                mb: 1,
                maxWidth: 700,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              Access and manage all your task lists in one place
            </Typography>
          </Box>

        {isLoading ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress size={48} thickness={4} />
              <Typography sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}>
                Loading your lists...
              </Typography>
          </Box>
        ) : lists.length > 0 ? (
            <Grid 
              container 
              spacing={4} 
              sx={{ 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-20px',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, rgba(5, 89, 201, 0) 0%, rgba(5, 89, 201, 0.1) 50%, rgba(5, 89, 201, 0) 100%)',
                }
              }}
            >
            {lists.map(list => (
              <Grid item xs={12} sm={6} md={4} key={list.id}>
                <Paper
                    elevation={0}
                  sx={{
                      p: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '20px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fbff 100%)',
                      overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(5, 89, 201, 0.1)',
                        '& .list-header': {
                          background: 'linear-gradient(135deg, rgba(5, 89, 201, 0.05) 0%, rgba(5, 89, 201, 0.12) 100%)',
                        },
                        '& .list-avatar': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 6px 16px rgba(5, 89, 201, 0.3)',
                        },
                        '& .open-button': {
                          background: 'linear-gradient(90deg, #0451B5 0%, #0066DB 100%)',
                          transform: 'translateY(-2px)',
                        }
                    }
                  }}
                  component={Link}
                  to={`/list/${list.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <Box 
                      className="list-header"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 3,
                        background: 'linear-gradient(135deg, rgba(5, 89, 201, 0.02) 0%, rgba(5, 89, 201, 0.08) 100%)',
                        borderBottom: '1px solid rgba(0,0,0,0.03)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                    <Avatar 
                        className="list-avatar"
                      sx={{ 
                        bgcolor: 'primary.main', 
                          background: 'linear-gradient(135deg, #0559C9 0%, #0078FF 100%)', 
                          width: 52, 
                          height: 52,
                          mr: 2,
                          boxShadow: '0 4px 10px rgba(5, 89, 201, 0.25)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <ListIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                      <Box>
                        <Typography variant="h6" component="h3" noWrap sx={{ fontWeight: 700 }}>
                          {list.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Created {new Date(list.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'short', 
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mb: 1.5
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 10,
                            bgcolor: 'rgba(5, 89, 201, 0.08)',
                            color: 'primary.main',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: 'success.main',
                              mr: 0.75
                            }} 
                          />
                          Active
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.8rem'
                          }}
                        >
                          <Box component="span" sx={{ 
                            display: 'inline-block',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: 'text.disabled',
                            mr: 0.75
                          }} />
                          {new Date(list.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 'auto',
                          opacity: 0.9,
                          fontStyle: 'italic'
                        }}
                      >
                        Click to view tasks and collaborate with your team
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="medium"
                        className="open-button"
                    sx={{ 
                          mt: 3, 
                      alignSelf: 'flex-start',
                          borderRadius: '12px',
                          background: 'linear-gradient(90deg, #0559C9 0%, #0078FF 100%)',
                          py: 1,
                          px: 3,
                      boxShadow: '0 4px 8px rgba(5, 89, 201, 0.2)',
                          transition: 'all 0.3s ease',
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Open List
                  </Button>
                    </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
              elevation={0} 
            sx={{ 
                p: { xs: 4, md: 6 }, 
                bgcolor: 'rgba(255,255,255,0.9)', 
              textAlign: 'center', 
                borderRadius: '28px',
              maxWidth: 700,
              mx: 'auto',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(90deg, #0559C9, #78A9FF)'
                }
              }}
            >
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EBF2FF 0%, #F9FBFF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  mx: 'auto',
                  border: '1px solid rgba(5, 89, 201, 0.1)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '120%',
                    height: '120%',
                    borderRadius: '50%',
                    border: '1px dashed rgba(5, 89, 201, 0.2)',
                    animation: 'spin 30s linear infinite',
                  },
            }}
          >
            <img 
              src={`${process.env.PUBLIC_URL}/logo512.png`} 
              alt="Logo" 
              style={{ 
                    width: 90, 
                    height: 90, 
                opacity: 0.8 
              }} 
            />
              </Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
              You don't have any lists yet
            </Typography>
              <Typography variant="body1" sx={{ mb: 5, color: 'text.secondary', maxWidth: '80%', mx: 'auto' }}>
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
                  borderRadius: '14px',
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
                            width: 110, 
                            height: 110,
                            borderRadius: '50%',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
                      }} 
                    />
                      </Box>
                      <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>
                      TaskSync Pro
                    </Typography>
                      <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, fontSize: '1.1rem', color: 'white' }}>
                      Upgrade to Pro for advanced features, unlimited lists, and priority support
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="inherit"
                        onClick={handleOpenEasterEgg}
                      sx={{ 
                          py: 1.5,
                          px: 4,
                          borderRadius: '12px',
                          borderWidth: '2px',
                          color: 'white',
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

      {/* Include the easter egg modal */}
      <ProFeaturesModal 
        open={isEasterEggOpen} 
        onClose={handleCloseEasterEgg} 
        isGiftOpen={isGiftOpen}
        lidRotation={lidRotation}
      />
    </>
  );
};

// ProFeaturesModal component - Easter Egg
const ProFeaturesModal: React.FC<{
  open: boolean;
  onClose: () => void;
  isGiftOpen: boolean;
  lidRotation: number;
}> = ({ open, onClose, isGiftOpen, lidRotation }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="pro-features-modal"
      aria-describedby="pro-features-easter-egg"
    >
      <Box sx={{
        position: 'absolute',
        top: { xs: '0', sm: '50%' },
        left: { xs: '0', sm: '50%' },
        right: { xs: '0', sm: 'auto' },
        bottom: { xs: '0', sm: 'auto' },
        transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
        width: { xs: '100%', sm: '80%', md: 900 },
        height: { xs: '100%', sm: 'auto' },
        maxHeight: { xs: '100%', sm: '90vh' },
        bgcolor: 'background.paper',
        borderRadius: { xs: 0, sm: 4 },
        boxShadow: 24,
        p: 0,
        outline: 'none',
        overflow: 'hidden',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Close button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'grey.500',
            zIndex: 20,
          }}
        >
          <CloseIcon />
        </IconButton>
        
        {/* Gift or Content Container */}
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch', // Improve momentum scrolling on iOS
        }}>
          {/* Gift Animation */}
          <Box sx={{
            height: 150,
            background: 'linear-gradient(135deg, #001E3C 0%, #0559C9 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0, // Prevent shrinking
          }}>
            {/* Gift box that opens to reveal content */}
            <Box sx={{
              position: 'relative',
              width: 100,
              height: 100,
              display: isGiftOpen ? 'none' : 'block',
              animation: 'pulse-gift 1s infinite alternate',
              '@keyframes pulse-gift': {
                '0%': { transform: 'scale(1)' },
                '100%': { transform: 'scale(1.05)' },
              }
            }}>
              {/* Gift box */}
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '80%',
                bottom: 0,
                background: 'linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%)',
                borderRadius: 2,
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }} />
              
              {/* Gift lid */}
              <Box sx={{
                position: 'absolute',
                width: '110%',
                height: '30%',
                top: 0,
                left: '-5%',
                background: 'linear-gradient(135deg, #ff6666 0%, #e60000 100%)',
                borderRadius: 2,
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                transformOrigin: 'bottom',
                transform: `rotateX(${lidRotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }} />
              
              {/* Gift ribbon */}
              <Box sx={{
                position: 'absolute',
                width: '20%',
                height: '100%',
                top: 0,
                left: '40%',
                background: 'linear-gradient(135deg, #ffcc00 0%, #ffaa00 100%)',
              }} />
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '20%',
                top: '40%',
                left: 0,
                background: 'linear-gradient(135deg, #ffcc00 0%, #ffaa00 100%)',
              }} />
              
              {/* Gift bow */}
              <Box sx={{
                position: 'absolute',
                width: '40%',
                height: '40%',
                top: '-20%',
                left: '30%',
                background: 'linear-gradient(135deg, #ffdd44 0%, #ffbb00 100%)',
                borderRadius: '50%',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                transform: 'rotate(45deg)',
              }} />
              <Box sx={{
                position: 'absolute',
                width: '40%',
                height: '40%',
                top: '-20%',
                left: '30%',
                background: 'linear-gradient(135deg, #ffdd44 0%, #ffbb00 100%)',
                borderRadius: '50%',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                transform: 'rotate(-45deg)',
              }} />
              
              {/* Gift opening glow */}
              {lidRotation > 50 && (
                <Box sx={{
                  position: 'absolute',
                  top: '20%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,221,68,0.8) 0%, rgba(255,221,68,0) 70%)',
                  animation: 'gift-glow 0.8s ease-out forwards',
                  '@keyframes gift-glow': {
                    '0%': { 
                      opacity: 0,
                      transform: 'translate(-50%, -50%) scale(0.2)',
                    },
                    '50%': { 
                      opacity: 1,
                      transform: 'translate(-50%, -50%) scale(1)',
                    },
                    '100%': { 
                      opacity: 0,
                      transform: 'translate(-50%, -50%) scale(2)',
                    },
                  }
                }} />
              )}
            </Box>
            
            
            {/* Text that appears after gift opens */}
            {isGiftOpen && (
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  animation: 'fade-in 0.5s forwards',
                  '@keyframes fade-in': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  }
                }}
              >
                Meet Our Developer
              </Typography>
            )}
          </Box>
          
          {/* Profile content appears after gift opens */}
          {isGiftOpen && (
            <Box sx={{
              p: { xs: 2, sm: 4 },
              animation: 'slide-up 0.5s forwards',
              '@keyframes slide-up': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              flex: 1,
            }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center',
                  }}>
                    <Avatar 
                      src={`${process.env.PUBLIC_URL}/logo512.png`}
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        mb: 2,
                        border: '4px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                      }}
                    />
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Emīls Samoilovs
                    </Typography>
                    <Typography variant="subtitle1" color="primary.main" fontWeight={600} gutterBottom>
                      Front-End Architect | AI Technologies
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      15+ years of experience in front-end and full-stack development
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <IconButton 
                        component={MuiLink} 
                        href="https://linkedin.com/in/emilssamoilovs" 
                        target="_blank"
                        sx={{ 
                          color: '#0A66C2',
                          '&:hover': { bgcolor: 'rgba(10, 102, 194, 0.1)' }
                        }}
                      >
                        <LinkedInIcon />
                      </IconButton>
                      <IconButton 
                        component={MuiLink} 
                        href="mailto:info@emilssamoilovs.com" 
                        sx={{ 
                          color: '#EA4335',
                          '&:hover': { bgcolor: 'rgba(234, 67, 53, 0.1)' }
                        }}
                      >
                        <EmailIcon />
                      </IconButton>
                      <IconButton 
                        component={MuiLink} 
                        href="tel:+37126493029" 
                        sx={{ 
                          color: '#34A853',
                          '&:hover': { bgcolor: 'rgba(52, 168, 83, 0.1)' }
                        }}
                      >
                        <PhoneIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    About Me
                  </Typography>
                  <Typography variant="body2" paragraph>
                    With over 15 years of dedicated experience in front-end and full-stack development (since 2008), 
                    I have cultivated a deep technical expertise that evolved from early passion into a professional career.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    I specialize in JavaScript, 
                    NodeJS, TypeScript, and modern web technologies with extensive experience in AI technologies integration.
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Technical Expertise
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(5, 89, 201, 0.08)',
                          height: '100%',
                        }}>
                          <CodeIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>JavaScript & TypeScript</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(5, 89, 201, 0.08)',
                          height: '100%',
                        }}>
                          <CodeIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>React</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(5, 89, 201, 0.08)',
                          height: '100%',
                        }}>
                          <StorageIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>REST APIs</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(5, 89, 201, 0.08)',
                          height: '100%',
                        }}>
                          <CodeIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>HTML5/CSS3</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(5, 89, 201, 0.08)',
                          height: '100%',
                        }}>
                          <CodeIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>Node.js</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(5, 89, 201, 0.08)',
                          height: '100%',
                        }}>
                          <SpeedIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>Performance Optimization</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ display: 'flex' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="large"
                      component={MuiLink}
                      href="https://www.linkedin.com/in/emilssamoilovs/"
                      target="_blank"
                      sx={{ 
                        mt: 2,
                        borderRadius: '12px',
                        background: 'linear-gradient(90deg, #0559C9 0%, #0078FF 100%)',
                        py: 1.5,
                        px: 4,
                        boxShadow: '0 8px 16px rgba(5, 89, 201, 0.3)',
                        transition: 'all 0.3s ease',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 20px rgba(5, 89, 201, 0.4)',
                          background: 'linear-gradient(90deg, #0451B5 0%, #0066DB 100%)',
                        }
                      }}
                    >
                      Hire Me Now
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default HomePage;
