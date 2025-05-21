import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Paper, 
  Fade,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { useTodo } from '../context/TodoContext';
import TaskList from '../components/TaskList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OnlineUsers from '../components/OnlineUsers';
import Chat from '../components/Chat';
import DeleteListButton from '../components/DeleteListButton';
import ShareIcon from '@mui/icons-material/Share';


const ListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { 
    loadListBySlug, 
    currentList, 
    isLoading, 
    error, 
    onlineUsers,
    messages,
    sendChatMessage,
    currentUser 
  } = useTodo();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const theme = useTheme();

  // Log online users when they change
  useEffect(() => {
    console.log('ListPage received onlineUsers:', onlineUsers);
  }, [onlineUsers]);

  useEffect(() => {
    if (slug) {
      loadListBySlug(slug);
    }
  }, [slug, loadListBySlug]);

  // Fallback copy function for unsupported browsers
  const fallbackCopy = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
    } catch (err) {
      alert('Copy failed. Please copy the link manually.');
    }
  };

  const handleShareList = () => {
    const url = window.location.href;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(url)
        .then(() => setCopySuccess(true))
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading your tasks...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !currentList) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText
            }}
          >
            <Typography variant="h4" gutterBottom>
              List Not Found
            </Typography>
            <Typography paragraph variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
              {error || "We couldn't find the list you're looking for. It may have been deleted or the link is incorrect."}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              size="large"
              startIcon={<ArrowBackIcon />}
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.background.default,
                }
              }}
            >
              Return to Home
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', md: 'row' }} 
        gap={2} 
        mt={4}
      >
        <Box flex={1}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  float: 'left'
                }}
              >
                {currentList.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexDirection: 'row' }}>
                <Button
                  startIcon={<ShareIcon />}
                  onClick={handleShareList}
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: 8,
                    px: { xs: 1, sm: 2 },
                    minWidth: { xs: 40, sm: 90 },
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    transition: 'all 0.2s ease',
                    mr: { xs: 0, sm: 1 },
                    mb: { xs: 1, sm: 0 },
                    '& .MuiButton-startIcon': {
                      mr: { xs: 0, sm: 1 },
                    },
                    '&:hover': {
                      transform: 'scale(1.05)',
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Share List</Box>
                </Button>
                <DeleteListButton listId={currentList.id} listTitle={currentList.title} isMobileButton />
              </Box>
            </Box>
            <TaskList />
          </Paper>
        </Box>
        <Box 
          width={{ xs: '100%', md: 300 }} 
          sx={{ 
            position: { xs: 'static', md: 'sticky' },
            top: 24,
            order: { xs: -1, md: 0 }
          }}
        >
          <OnlineUsers users={onlineUsers} />
          {currentUser && (
            <Box mt={2}>
              <Chat 
                messages={messages}
                onSendMessage={sendChatMessage}
                currentUser={currentUser}
              />
            </Box>
          )}
        </Box>
      </Box>
      
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={3000} 
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Link copied to clipboard! You can now share it with others.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListPage;
