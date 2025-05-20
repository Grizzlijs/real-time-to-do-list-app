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
  useMediaQuery,
} from '@mui/material';
import { useTodo } from '../context/TodoContext';
import TaskList from '../components/TaskList';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OnlineUsers from '../components/OnlineUsers';
import Chat from '../components/Chat';
import DeleteListButton from '../components/DeleteListButton';


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
  const [titleEditMode, setTitleEditMode] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Log online users when they change
  useEffect(() => {
    console.log('ListPage received onlineUsers:', onlineUsers);
  }, [onlineUsers]);

  useEffect(() => {
    if (slug) {
      loadListBySlug(slug);
    }
  }, [slug, loadListBySlug]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
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
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 2,
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {currentList.title}
              </Typography>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                variant="outlined"
                color="primary"
                fullWidth={isMobile}
                sx={{
                  borderRadius: 8,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText
                  }
                }}
              >
                Share List
              </Button>
              
              <DeleteListButton listId={currentList.id} listTitle={currentList.title} />
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
