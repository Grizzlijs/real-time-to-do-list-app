import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import { useTodo } from '../context/TodoContext';
import TaskList from '../components/TaskList';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { loadListBySlug, currentList, isLoading, error } = useTodo();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (slug) {
      loadListBySlug(slug);
    }
  }, [slug, loadListBySlug]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !currentList) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            List Not Found
          </Typography>
          <Typography paragraph>
            {error || "We couldn't find the list you're looking for."}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyLink}
          variant="outlined"
          size="small"
          color={copySuccess ? "success" : "primary"}
        >
          {copySuccess ? "Link Copied!" : "Share List"}
        </Button>
      </Box>
      
      <TaskList />
    </Container>
  );
};

export default ListPage;
