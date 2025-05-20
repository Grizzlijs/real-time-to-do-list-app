import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import OnlineUsers from './OnlineUsers';
import Chat from './Chat';
import { useTodo } from '../context/TodoContext';

const TodoList: React.FC = () => {
  const { currentList, onlineUsers, messages, sendChatMessage, currentUser } = useTodo();

  if (!currentList) {
    return null;
  }

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
              {currentList.title}
            </Typography>
            <TaskForm />
            <Box sx={{ flex: 1, overflow: 'auto', mt: 2 }}>
              <TaskList />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <OnlineUsers users={onlineUsers} />
            {currentUser && (
              <Chat 
                messages={messages}
                onSendMessage={sendChatMessage}
                currentUser={currentUser}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TodoList; 