import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';

const CreateListPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const { createNewList, isLoading } = useTodo();
  const navigate = useNavigate();

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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create a New To-Do List
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="List Title"
            fullWidth
            margin="normal"
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            disabled={isLoading}
            autoFocus
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create List'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateListPage;
