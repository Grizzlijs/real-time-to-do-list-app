import React, { useState } from 'react';
import { Button, Avatar, Menu, MenuItem, ListItemIcon, Typography, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTodo } from '../context/TodoContext';
import UsernameDialog from './UsernameDialog';
import { getUserInfoFromStorage } from '../services/socket';

const UserProfileButton: React.FC = () => {
  const { currentUser, setUserInfo, isUsernameDialogOpen, setUsernameDialogOpen: setUsernameDialog } = useTodo();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOpenUsernameDialog = () => {
    setUsernameDialog(true);
    handleClose();
  };
  const handleUsernameDialogClose = (username: string | null) => {
    setUsernameDialog(false);
    
    if (username && currentUser) {
      setUserInfo(username, currentUser.color);
    }
  };

  if (!currentUser) {
    return null;
  }

  const storedUserInfo = getUserInfoFromStorage();

  return (
    <>
      <Button
        startIcon={
          <Avatar
            sx={{
              bgcolor: currentUser.color,
              width: 28,
              height: 28,
              fontSize: '0.875rem',
            }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </Avatar>
        }
        onClick={handleClick}
        sx={{ 
          color: 'text.primary',
          textTransform: 'none',
          ml: 1,
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, ml: 0.5 }}>
          {currentUser.name}
        </Typography>
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            minWidth: 200,
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '10px',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: currentUser.color, mr: 1.5 }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {currentUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Online
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <MenuItem onClick={handleOpenUsernameDialog} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Edit username
        </MenuItem>
      </Menu>
      
      <UsernameDialog
        open={isUsernameDialogOpen}
        onClose={handleUsernameDialogClose}
        initialUsername={storedUserInfo.name}
        initialColor={storedUserInfo.color}
      />
    </>
  );
};

export default UserProfileButton;
