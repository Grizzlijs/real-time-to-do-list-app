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
  Menu,
  MenuItem,
  Box,
  Divider,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
// uuid is used in context but not here

const Header: React.FC = () => {
  const { lists, createNewList, currentList } = useTodo();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };
  
  const handleCloseMobileMenu = () => {
    setMobileMenuAnchor(null);
  };

  // Open a list from the menu
  const handleOpenList = (slug: string) => {
    navigate(`/list/${slug}`);
    handleCloseMenu();
    handleCloseMobileMenu();
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
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'white', 
          color: 'text.primary',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 1, md: 2 }, justifyContent: 'space-between' }}>
            {/* Left side - Logo and App Name */}
            <Box 
              component={Link}
              to="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
              }}
            >
              
              <img 
                src={`${process.env.PUBLIC_URL}/logo512.png`} 
                alt="Logo" 
                style={{ 
                  width: 36, 
                  height: 36, 
                  marginRight: 12,
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                TaskSync
              </Typography>
            </Box>
            
            {/* Middle - Current list indicator */}
            {currentList && (
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                py: 0.5, 
                px: 2, 
                bgcolor: 'rgba(5, 89, 201, 0.06)', 
                borderRadius: 2,
                border: '1px solid rgba(5, 89, 201, 0.1)'
              }}>
                <ListIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1, opacity: 0.8 }} />
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  {currentList.title}
                </Typography>
              </Box>
            )}
            
            {/* Right side - Action buttons */}
            {!isMobile ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <Button 
                  variant="outlined"
                  color="primary" 
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                    px: 2,
                    '&:hover': {
                      boxShadow: '0 2px 6px rgba(5, 89, 201, 0.2)',
                    }
                  }}
                  startIcon={<AddIcon />}
                  onClick={() => setIsDialogOpen(true)}
                >
                  New List
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    textTransform: 'none',
                    boxShadow: '0 2px 6px rgba(5, 89, 201, 0.2)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(5, 89, 201, 0.3)',
                    }
                  }}
                  onClick={handleOpenMenu}
                  endIcon={<MenuIcon />}
                >
                  My Lists
                </Button>

              </Stack>
            ) : (
              // Mobile menu
              <>
                <IconButton 
                  color="primary" 
                  edge="end" 
                  onClick={handleOpenMobileMenu}
                >
                  <MenuIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Container>
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
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5, 
            width: 250,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <MenuItem disabled sx={{ bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
            Your Lists
          </Typography>
        </MenuItem>
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {lists.map(list => (
            <MenuItem 
              key={list.id} 
              onClick={() => handleOpenList(list.slug)}
              selected={currentList?.id === list.id}
              sx={{ 
                borderLeft: currentList?.id === list.id ? '3px solid' : '3px solid transparent',
                borderLeftColor: 'primary.main',
                pl: currentList?.id === list.id ? 1.7 : 2,
              }}
            >
              <ListIcon sx={{ mr: 1.5, fontSize: 20, color: 'primary.main', opacity: 0.8 }} />
              <Typography noWrap sx={{ fontWeight: 500 }}>{list.title}</Typography>
            </MenuItem>
          ))}
        </Box>
        {lists.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">No lists found</Typography>
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          onClick={() => {
            setIsDialogOpen(true);
            handleCloseMenu();
          }}
          sx={{ 
            py: 1.5,
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(5, 89, 201, 0.08)'
            }
          }}
        >
          <AddIcon sx={{ mr: 1.5 }} />
          <Typography fontWeight={500}>Create New List</Typography>
        </MenuItem>
      </Menu>
      
      {/* Mobile menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleCloseMobileMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5, 
            width: 200,
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => { 
          navigate('/');
          handleCloseMobileMenu();
        }}>
          <DashboardIcon sx={{ mr: 2 }} />
          Dashboard
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setIsDialogOpen(true);
            handleCloseMobileMenu();
          }}
        >
          <AddIcon sx={{ mr: 2 }} />
          New List
        </MenuItem>
        <Divider />
        <Box sx={{ p: 1, px: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Your Lists
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {lists.map(list => (
            <MenuItem 
              key={list.id} 
              onClick={() => handleOpenList(list.slug)}
              selected={currentList?.id === list.id}
            >
              <ListIcon sx={{ mr: 2, fontSize: 20 }} />
              <Typography noWrap variant="body2">{list.title}</Typography>
            </MenuItem>
          ))}
          {lists.length === 0 && (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">No lists found</Typography>
            </MenuItem>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleCloseMobileMenu}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
      </Menu>
      
      {/* New list dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Create New List
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <img 
              src={`${process.env.PUBLIC_URL}/logo512.png`} 
              alt="Logo" 
              style={{ 
                width: 40, 
                height: 40, 
                marginRight: 12,
                opacity: 0.8
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              Create a list to organize your tasks
            </Typography>
          </Box>
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
            InputProps={{
              sx: {
                borderRadius: 1.5
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained" 
            color="primary"
            disabled={!newListTitle.trim()}
            sx={{ 
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(5, 89, 201, 0.2)'
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
