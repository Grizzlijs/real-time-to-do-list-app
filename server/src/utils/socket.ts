import { Server, Socket } from 'socket.io';
import pool from '../db';

interface OnlineUser {
  id: string;
  name: string;
  color: string;
  listId?: string;
}

const onlineUsers = new Map<string, OnlineUser>();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const user: OnlineUser = {
      id: socket.id,
      name: socket.handshake.auth.name || 'Anonymous',
      color: socket.handshake.auth.color || '#000000'
    };
    
    onlineUsers.set(socket.id, user);
    console.log(`User connected: ${user.name} (${socket.id})`);
    
    // Broadcast updated user list to all clients
    const broadcastUserList = (listId: string) => {
      // Filter users who are in this specific list
      const userList = Array.from(onlineUsers.values())
        .filter(u => u.listId === listId);
      console.log(`Broadcasting online users for list ${listId}:`, userList);
      io.to(`list-${listId}`).emit('online-users', userList);
    };
    
    // Send initial user list to the new user
    socket.emit('online-users', Array.from(onlineUsers.values()));
    
    // Handle request for online users
    socket.on('get-online-users', () => {
      console.log(`User ${user.name} requested online users list`);
      socket.emit('online-users', Array.from(onlineUsers.values()));
    });
    
    // Join a specific to-do list room
    socket.on('join-list', (listId: string) => {
      const roomName = `list-${listId}`;
      socket.join(roomName);
      
      // Update user's current list
      const user = onlineUsers.get(socket.id);
      if (user) {
        user.listId = listId;
        onlineUsers.set(socket.id, user);
        console.log(`Updated user ${user.name} current list to ${listId}`);
      }
      
      console.log(`User ${socket.handshake.auth.name} joined list ${listId} (Room: ${roomName})`);
      
      // Log number of clients in this room
      const roomClients = io.sockets.adapter.rooms.get(roomName);
      console.log(`Number of clients in room ${roomName}: ${roomClients ? roomClients.size : 0}`);
      
      // Broadcast updated user list for this specific list
      broadcastUserList(listId);
    });

    // Leave a specific to-do list room
    socket.on('leave-list', (listId: string) => {
      const roomName = `list-${listId}`;
      socket.leave(roomName);
      
      // Update user's current list
      const user = onlineUsers.get(socket.id);
      if (user) {
        user.listId = undefined;
        onlineUsers.set(socket.id, user);
        console.log(`Removed list ${listId} from user ${user.name}`);
      }
      
      console.log(`User ${socket.handshake.auth.name} left list ${listId} (Room: ${roomName})`);
      
      // Broadcast updated user list for this specific list
      broadcastUserList(listId);
    });

    // Handle task updates (edit, completion, order)
    socket.on('task-update', async (data) => {
      try {
        const { listId, task } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Received task-update from ${socket.handshake.auth.name} for list ${listId}:`, {
          task: { id: task.id, title: task.title }
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('task-updated', { listId, task });
        console.log(`Broadcasted task-updated event to room ${roomName}`);
      } catch (error) {
        console.error('Error handling task update via socket:', error);
      }
    });

    // Handle task deletion
    socket.on('task-delete', async (data) => {
      try {
        const { listId, taskId } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Received task-delete from ${socket.handshake.auth.name} for list ${listId}:`, {
          taskId
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('task-deleted', { listId, taskId });
        console.log(`Broadcasted task-deleted event to room ${roomName}`);
      } catch (error) {
        console.error('Error handling task deletion via socket:', error);
      }
    });

    // Handle task reordering (drag & drop)
    socket.on('tasks-reorder', async (data) => {
      try {
        const { listId, tasks } = data;
        const roomName = `list-${listId}`;
        
        console.log(`Received tasks-reorder from ${socket.handshake.auth.name} for list ${listId}:`, {
          taskCount: tasks.length
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('tasks-reordered', { listId, tasks });
        console.log(`Broadcasted tasks-reordered event to room ${roomName}`);
      } catch (error) {
        console.error('Error handling tasks reordering via socket:', error);
      }
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      try {
        const { listId, message } = data;
        const roomName = `list-${listId}`;
        const user = onlineUsers.get(socket.id);
        
        if (!user) {
          console.warn('User not found for chat message');
          return;
        }

        const chatMessage = {
          id: `${socket.id}-${Date.now()}`,
          text: message,
          sender: {
            name: user.name,
            color: user.color
          },
          timestamp: Date.now()
        };
        
        console.log(`Received chat message from ${user.name} for list ${listId}:`, {
          message: chatMessage.text
        });
        
        // Broadcast to all clients in the room including the sender
        io.to(roomName).emit('chat-message', chatMessage);
        console.log(`Broadcasted chat message to room ${roomName}`);
      } catch (error) {
        console.error('Error handling chat message via socket:', error);
      }
    });

    // Handle user info updates
    socket.on('user-info-update', (data: { name: string; color: string }) => {
      try {
        const { name, color } = data;
        const user = onlineUsers.get(socket.id);
        
        if (!user) {
          console.warn('User not found for user info update');
          return;
        }
        
        // Update user info in memory
        user.name = name;
        user.color = color;
        onlineUsers.set(socket.id, user);
        
        console.log(`User ${socket.id} updated their info:`, { name, color });
        
        // Broadcast the update to all relevant rooms
        if (user.listId) {
          const roomName = `list-${user.listId}`;
          io.to(roomName).emit('user-info-updated', {
            id: socket.id,
            name,
            color
          });
          console.log(`Broadcasted user info update to room ${roomName}`);
          
          // Update online users list for the current list
          broadcastUserList(user.listId);
        }
      } catch (error) {
        console.error('Error handling user info update via socket:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user?.listId) {
        console.log(`User disconnected: ${user.name} (${socket.id}) from list ${user.listId}`);
        // Broadcast updated user list for the list they were in
        broadcastUserList(user.listId);
      }
      onlineUsers.delete(socket.id);
      console.log('Remaining online users:', Array.from(onlineUsers.values()));
    });
  });
};
