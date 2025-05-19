import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import MenuIcon from '@mui/icons-material/Menu';
import { v4 as uuidv4 } from 'uuid';

const Header: React.FC = () => {
  const { lists, createNewList, currentList } = useTodo();
  const navigate = useNavigate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Open a list from the menu
  const handleOpenList = (slug: string) => {
    navigate(`/list/${slug}`);
    handleCloseMenu();
  };

  // Create a new list
  const handleCreateList = async () => {
    if (newListTitle.trim() === '') return;
    
    try {
      const newList = await createNewList(newListTitle);
      setIsDialogOpen(false);
      setNewListTitle('');
      navigate(`/list/${newList.slug}`);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Collaborative To-Do List
          </Typography>
          
          {/* Current list indicator */}
          {currentList && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="subtitle1">
                {currentList.title}
              </Typography>
            </Box>
          )}
          
          {/* Lists menu */}
          <Stack direction="row" spacing={1}>
            <Button 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => setIsDialogOpen(true)}
            >
              New List
            </Button>
            
            <IconButton 
              color="inherit" 
              onClick={handleOpenMenu}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      
      {/* Lists dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Your Lists</Typography>
        </MenuItem>
        <Divider />
        {lists.map(list => (
          <MenuItem 
            key={list.id} 
            onClick={() => handleOpenList(list.slug)}
            selected={currentList?.id === list.id}
          >
            <ListIcon sx={{ mr: 1 }} />
            {list.title}
          </MenuItem>
        ))}
        {lists.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">No lists found</Typography>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => setIsDialogOpen(true)}>
          <AddIcon sx={{ mr: 1 }} />
          Create New List
        </MenuItem>
      </Menu>
      
      {/* New list dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Title"
            fullWidth
            variant="outlined"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateList();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained" 
            color="primary"
            disabled={!newListTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
