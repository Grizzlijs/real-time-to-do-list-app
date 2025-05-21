import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface UsernameDialogProps {
  open: boolean;
  onClose: (username: string | null) => void;
  initialUsername: string;
  initialColor: string;
}

const ColorOption = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  width: 36,
  height: 36,
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

const UsernameDialog: React.FC<UsernameDialogProps> = ({ 
  open, 
  onClose, 
  initialUsername, 
  initialColor 
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
    '#E67E22', '#2ECC71', '#1ABC9C', '#F1C40F'
  ];

  useEffect(() => {
    setUsername(initialUsername);
    setSelectedColor(initialColor);
  }, [initialUsername, initialColor]);

  const handleSubmit = () => {
    onClose(username.trim() || initialUsername);
  };

  const handleCancel = () => {
    onClose(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: { xs: '100%', sm: 400 },
          width: { xs: '100%', sm: 'auto' },
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Set Your Username
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose a username that other users will see when you collaborate.
          </Typography>
        </Box>
        
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id="username-input"
          name="username-input"
          InputProps={{
            startAdornment: (
              <Avatar 
                sx={{ 
                  bgcolor: selectedColor,
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem',
                  marginRight: 1
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
            )
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose a color:
          </Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            {colors.map((color) => (
              <Grid item key={color}>
                <ColorOption 
                  sx={{ bgcolor: color }}
                  selected={selectedColor === color}
                  onClick={() => setSelectedColor(color)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={handleCancel} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={!username.trim()}
          sx={{ 
            textTransform: 'none',
            px: 3 
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsernameDialog;
