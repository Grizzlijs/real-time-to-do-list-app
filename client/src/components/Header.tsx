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
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import UserProfileButton from './UserProfileButton';
// uuid is used in context but not here

const Header: React.FC = () => {
  const { lists, createNewList, currentList } = useTodo();
  const { logout } = useAuth();
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
  
  const handleLogout = () => {
    logout();
    navigate('/login');
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
          borderRadius: '0',
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
                  Current List: {currentList.title}
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
                  <Divider orientation="vertical" flexItem sx={{ mx: 0 }} />
                
                <UserProfileButton />
                
                <IconButton
                  color="primary"
                  onClick={handleLogout}
                  title="Logout"
                  sx={{
                    ml: 1,
                    '&:hover': {
                      bgcolor: 'rgba(244, 67, 54, 0.08)',
                      color: 'error.main'
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Stack>
            ) : (
              // Mobile menu
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UserProfileButton />
                  <IconButton
                    color="primary"
                    onClick={handleLogout}
                    title="Logout"
                    sx={{
                      mr: 1,
                      '&:hover': {
                        bgcolor: 'rgba(244, 67, 54, 0.08)',
                        color: 'error.main'
                      }
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    edge="end" 
                    onClick={handleOpenMobileMenu}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
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
          elevation: 0,
          sx: { 
            mt: 1.5, 
            width: { xs: '90%', sm: 320 },
            maxHeight: { xs: '70vh', sm: 'auto' },
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
              zIndex: 0,
            }
          }
        }}
        transitionDuration={250}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ px: 2, pt: 2 }}>
          Your Lists
        </Typography>
        
        <Box sx={{ 
          maxHeight: { xs: 'calc(70vh - 100px)', sm: 320 }, 
          overflow: 'auto',
          px: 1.5,
          py: 1.5,
          '&::-webkit-scrollbar': {
            width: '6px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.2)',
          },
          WebkitOverflowScrolling: 'touch', // Improve momentum scrolling on iOS
        }}>
          {lists.map((list, index) => (
            <Box key={list.id} sx={{ position: 'relative' }}>
              <MenuItem 
                onClick={() => handleOpenList(list.slug)}
                selected={currentList?.id === list.id}
                sx={{ 
                  px: 2,
                  py: 1.5,
                  mb: 0.5,
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  background: currentList?.id === list.id ? 'linear-gradient(90deg, rgba(5, 89, 201, 0.12) 0%, rgba(5, 89, 201, 0.05) 100%)' : 'transparent',
                  '&:hover': {
                    background: currentList?.id === list.id 
                      ? 'linear-gradient(90deg, rgba(5, 89, 201, 0.15) 0%, rgba(5, 89, 201, 0.08) 100%)'
                      : 'rgba(0, 0, 0, 0.02)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.03)',
                  },
                  '&::before': currentList?.id === list.id ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '10%',
                    height: '80%',
                    width: '4px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: 'primary.main',
                    boxShadow: '0 0 8px rgba(5, 89, 201, 0.5)',
                  } : {}
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    minWidth: 40,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    background: currentList?.id === list.id 
                      ? 'linear-gradient(135deg, #0559C9 0%, #0078FF 100%)' 
                      : 'rgba(5, 89, 201, 0.1)',
                    boxShadow: currentList?.id === list.id 
                      ? '0 4px 10px rgba(5, 89, 201, 0.3)'
                      : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    <ListIcon 
                      sx={{ 
                        fontSize: 20, 
                        color: currentList?.id === list.id ? 'white' : 'primary.main',
                      }} 
                    />
                  </Box>
                  <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
                    <Typography 
                      noWrap 
                      sx={{ 
                        fontWeight: currentList?.id === list.id ? 700 : 500,
                        color: currentList?.id === list.id ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {list.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        color: 'text.secondary',
                        fontSize: '0.7rem' 
                      }}
                    >
                      Created {new Date(list.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Box>
          ))}
          
          {lists.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              px: 2,
              textAlign: 'center'
            }}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  background: 'rgba(5, 89, 201, 0.08)',
                  border: '1px dashed rgba(5, 89, 201, 0.2)'
                }}
              >
                <ListIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No lists found
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mb: 2 }}>
                Create your first list to get started
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(5, 89, 201, 0.02)'
        }}>
          <Button 
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              setIsDialogOpen(true);
              handleCloseMenu();
            }}
            startIcon={<AddIcon />}
            sx={{ 
              py: 1.2,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #0559C9 0%, #0078FF 100%)',
              boxShadow: '0 4px 12px rgba(5, 89, 201, 0.25)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #0451B5 0%, #0066DB 100%)',
                boxShadow: '0 6px 15px rgba(5, 89, 201, 0.35)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Create New List
          </Button>
        </Box>
      </Menu>
      
      {/* Mobile menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleCloseMobileMenu}
        PaperProps={{
          elevation: 0,
          sx: { 
            width: '100%',
            maxWidth: '100%',
            top: '56px !important',
            left: '0px !important',
            right: '0px',
            maxHeight: 'calc(100vh - 56px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            border: 'none',
            borderRadius: '0 0 16px 16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            mt: 0,
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
              zIndex: 0,
            }
          }
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transitionDuration={250}
      >
        {/* Header */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #172B4D 30%, #0559C9 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TaskSync Menu
          </Typography>
        </Box>
        
        {/* Main actions */}
        <Box sx={{ p: 1.5 }}>
          
          <MenuItem 
            onClick={() => {
              setIsDialogOpen(true);
              handleCloseMobileMenu();
            }}
            sx={{ 
              borderRadius: '12px',
              py: 1.5,
              mb: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.02)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.03)',
              }
            }}
          >
            <Box sx={{ 
              width: 36, 
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 89, 201, 0.1)',
              mr: 1.5
            }}>
              <AddIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            <Typography fontWeight={500}>New List</Typography>
          </MenuItem>
        </Box>
        
        {/* Your Lists section */}
        <Box sx={{ 
          px: 2.5, 
          py: 2, 
          mt: 0.5, 
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: lists.length > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <ListIcon sx={{ fontSize: 16, opacity: 0.7 }} />
            Your Lists
            <Box component="span" sx={{ 
              ml: 'auto',
              fontSize: '0.75rem', 
              py: 0.25, 
              px: 1, 
              borderRadius: 10,
              backgroundColor: 'rgba(5, 89, 201, 0.08)',
              color: 'primary.main'
            }}>
              {lists.length}
            </Box>
          </Typography>
        </Box>
        
        {/* Lists */}
        <Box sx={{ 
          maxHeight: 240, 
          overflow: 'auto',
          py: lists.length > 0 ? 1.5 : 0,
          px: 1.5,
          '&::-webkit-scrollbar': {
            width: '4px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '10px',
          }
        }}>
          {lists.map(list => (
            <MenuItem 
              key={list.id} 
              onClick={() => handleOpenList(list.slug)}
              selected={currentList?.id === list.id}
              sx={{ 
                borderRadius: '10px',
                py: 1.25,
                mb: 0.5,
                transition: 'all 0.2s ease',
                background: currentList?.id === list.id ? 'linear-gradient(90deg, rgba(5, 89, 201, 0.12) 0%, rgba(5, 89, 201, 0.05) 100%)' : 'transparent',
                '&:hover': {
                  background: currentList?.id === list.id 
                    ? 'linear-gradient(90deg, rgba(5, 89, 201, 0.15) 0%, rgba(5, 89, 201, 0.08) 100%)'
                    : 'rgba(0, 0, 0, 0.02)',
                  transform: 'translateY(-2px)',
                },
                '&::before': currentList?.id === list.id ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: '3px',
                  borderRadius: '0 3px 3px 0',
                  backgroundColor: 'primary.main',
                } : {}
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListIcon sx={{ 
                  mr: 1.5, 
                  fontSize: 18,
                  color: currentList?.id === list.id ? 'primary.main' : 'text.secondary',
                  opacity: 0.9
                }} />
                <Typography 
                  noWrap 
                  variant="body2" 
                  sx={{ 
                    fontWeight: currentList?.id === list.id ? 600 : 400,
                    color: currentList?.id === list.id ? 'primary.main' : 'text.primary'
                  }}
                >
                  {list.title}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          {lists.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 3,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.disabled">
                No lists found
              </Typography>
            </Box>
          )}
        </Box>
      
      </Menu>
      
      {/* New list dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            maxHeight: { xs: '100%', sm: '80vh' },
            margin: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '100%', sm: 600 },
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }
        }}
        fullScreen={isMobile}
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Create New List
        </DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto' }}>
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
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
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
