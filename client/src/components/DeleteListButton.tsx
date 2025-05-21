import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTodo } from '../context/TodoContext';

interface DeleteListButtonProps {
  listId: number;
  listTitle: string;
  isMobileButton?: boolean;
}

const DeleteListButton: React.FC<DeleteListButtonProps> = ({ listId, listTitle, isMobileButton }) => {
  const [open, setOpen] = useState(false);
  const { deleteList, isLoading } = useTodo();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteList(listId);
      handleClose();
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  return (
    <>
      <Button
        startIcon={<DeleteIcon />}
        onClick={handleClickOpen}
        variant="outlined"
        color="error"
        sx={{
          borderRadius: 8,
          px: isMobileButton ? { xs: 1, sm: 2 } : 2,
          minWidth: isMobileButton ? { xs: 40, sm: 90 } : undefined,
          fontSize: isMobileButton ? { xs: '0.85rem', sm: '1rem' } : undefined,
          transition: 'all 0.2s ease',
          mb: isMobileButton ? { xs: 1, sm: 0 } : 0,
          '& .MuiButton-startIcon': {
            mr: isMobileButton ? { xs: 0, sm: 1 } : 1,
          },
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }
        }}
      >
        {isMobileButton ? (
          <span style={{ display: 'none', ...((window.innerWidth >= 600) && { display: 'inline' }) }}>Delete List</span>
        ) : (
          'Delete List'
        )}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete List
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete the list "{listTitle}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteListButton; 