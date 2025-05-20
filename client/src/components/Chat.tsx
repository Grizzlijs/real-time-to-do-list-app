import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';

interface Message {
  id: string;
  text: string;
  sender: {
    name: string;
    color: string;
  };
  timestamp: number;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUser: {
    name: string;
    color: string;
  };
}

const ChatContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const MessagesList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
}));

const MessageItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MessageAvatar = styled(Avatar)<{ usercolor: string }>(({ usercolor }) => ({
  backgroundColor: usercolor,
  width: 32,
  height: 32,
  marginRight: 8,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ChatContainer elevation={2}>
      <Typography variant="h6" gutterBottom sx={{ 
        color: 'primary.main',
        fontWeight: 'bold',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 1,
        mb: 2
      }}>
        Chat
      </Typography>
      
      <MessagesList>
        {messages.map((message) => (
          <MessageItem key={message.id}>
            <MessageAvatar usercolor={message.sender.color}>
              {message.sender.name.charAt(0).toUpperCase()}
            </MessageAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    component="span" 
                    variant="subtitle2" 
                    sx={{ 
                      color: message.sender.color,
                      fontWeight: 'bold'
                    }}
                  >
                    {message.sender.name}
                  </Typography>
                  <Typography 
                    component="span" 
                    variant="caption" 
                    sx={{ color: 'text.secondary' }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              }
              secondary={message.text}
              secondaryTypographyProps={{
                sx: { 
                  color: 'text.primary',
                  wordBreak: 'break-word'
                }
              }}
            />
          </MessageItem>
        ))}
        <div ref={messagesEndRef} />
      </MessagesList>

      <Divider sx={{ my: 1 }} />

      <form onSubmit={handleSendMessage}>
        <InputContainer>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              }
            }}
          />
          <IconButton 
            color="primary" 
            type="submit"
            disabled={!newMessage.trim()}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </InputContainer>
      </form>
    </ChatContainer>
  );
};

export default Chat; 