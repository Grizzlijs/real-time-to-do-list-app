import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

const HomePage: React.FC = () => {
  const { lists, loadLists, isLoading } = useTodo();

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Collaborative To-Do List
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Create, share, and collaborate on to-do lists in real-time
        </Typography>
        <Button
          component={Link}
          to="/create"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          sx={{ mt: 2 }}
        >
          Create New List
        </Button>
      </Box>

      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Your Lists
      </Typography>

      {isLoading ? (
        <Typography>Loading your lists...</Typography>
      ) : lists.length > 0 ? (
        <Grid container spacing={3}>
          {lists.map(list => (
            <Grid item xs={12} sm={6} md={4} key={list.id}>
              <Paper
                elevation={2}
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
                  variant="outlined"
                  size="small"
                  sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                >
                  Open List
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            You don't have any lists yet.
          </Typography>
          <Button
            component={Link}
            to="/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Create Your First List
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default HomePage;
