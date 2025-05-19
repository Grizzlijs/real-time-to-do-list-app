import React, { useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Grid, Paper, 
  Divider, Card, CardContent, CardMedia, CardActions
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const HomePage: React.FC = () => {
  const { lists, loadLists, isLoading } = useTodo();

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <>
      {/* Hero Section - Similar to Ubiquiti's "Ocean of 6 GHz Spectrum" */}
      <Box className="hero-section">
        <Container maxWidth="md" className="hero-content">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
            Real-Time Collaborative To-Do Lists
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 300, opacity: 0.9 }}>
            Seamless Task Management for Teams
          </Typography>
          <Button
            component={Link}
            to="/create"
            variant="contained"
            color="primary"
            size="large"
            className="cta-button"
            sx={{ mt: 2, mb: 6, px: 4, py: 1.5 }}
          >
            Create List
          </Button>
          
          {/* Orbit graphic placeholder - similar to UniFi's sphere */}
          <Box sx={{ 
            width: 180, 
            height: 180, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            position: 'relative', 
            mx: 'auto',
            boxShadow: '0 0 60px rgba(25,118,210,0.6)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(25,118,210,0.4) 0%, rgba(0,0,0,0) 70%)'
            }} />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '20px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              animation: 'rotate 8s linear infinite',
              '@keyframes rotate': {
                from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
                to: { transform: 'translate(-50%, -50%) rotate(360deg)' }
              }
            }} />
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>      {/* Feature cards section - Similar to UniFi's "Meet UniFi" section */}
      <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 5, fontWeight: 500 }}>
        Powerful Task Management
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card className="feature-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="div"
              sx={{ height: 180, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CheckCircleIcon sx={{ fontSize: 80, color: '#fff' }} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Track Completion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Easily mark tasks as completed, filter by status, and keep track of your team's progress in real-time.
              </Typography>
            </CardContent>
            <CardActions sx={{ mt: 'auto' }}>
              <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>Learn More</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="feature-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="div"
              sx={{ height: 180, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <GroupIcon sx={{ fontSize: 80, color: '#fff' }} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Real-Time Collaboration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Work together seamlessly with your team members. All changes appear instantly for everyone connected to the list.
              </Typography>
            </CardContent>
            <CardActions sx={{ mt: 'auto' }}>
              <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>Learn More</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="feature-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="div"
              sx={{ height: 180, bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <DragIndicatorIcon sx={{ fontSize: 80, color: '#fff' }} />
            </CardMedia>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Drag & Drop Reordering
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Easily prioritize tasks by dragging and dropping them into your preferred order. Changes sync instantly across devices.
              </Typography>
            </CardContent>
            <CardActions sx={{ mt: 'auto' }}>
              <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>Learn More</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 8 }} />
      
      {/* Your Lists section */}
      <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 5, fontWeight: 500 }}>
        Your To-Do Lists
      </Typography>

      {isLoading ? (
        <Typography>Loading your lists...</Typography>
      ) : lists.length > 0 ? (
        <Grid container spacing={3}>
          {lists.map(list => (
            <Grid item xs={12} sm={6} md={4} key={list.id}>
              <Paper
                elevation={2}
                className="feature-card"
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                component={Link}
                to={`/list/${list.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ListIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3" noWrap>
                    {list.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Created: {new Date(list.created_at).toLocaleString()}
                </Typography>
                  <Button
                  variant="contained"
                  size="small"
                  className="cta-button"
                  sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Open List
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={3} sx={{ p: 5, backgroundColor: '#f5f5f5', textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" paragraph>
            You don't have any lists yet.
          </Typography>
          <Button
            component={Link}
            to="/create"
            variant="contained"
            color="primary"
            className="cta-button"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create Your First List
          </Button>
        </Paper>
      )}
      </Container>
      
      {/* Get Started section - similar to UniFi's "Get Started with UniFi" */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 5, fontWeight: 500 }}>
            Get Started with Real-Time To-Do Lists
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Create & Share To-Do Lists
              </Typography>
              <Typography variant="body1" paragraph>
                Start by creating a new list, add your tasks, and share the unique URL with your team members for seamless collaboration.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/create" 
                className="cta-button"
                endIcon={<ArrowForwardIcon />}
                sx={{ mb: 2 }}
              >
                Create New List
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={6} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'white', 
                  borderRadius: 2, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}
              >
                {/* Application screenshot placeholder */}
                <Box 
                  sx={{ 
                    height: 240, 
                    bgcolor: '#e0e0e0', 
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                  }}
                >
                  <ListIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                  <Typography variant="body2" textAlign="center" color="text.secondary">
                    Application screenshot preview
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
