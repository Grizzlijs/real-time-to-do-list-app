import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTodo } from '../context/TodoContext';

interface DeleteListButtonProps {
  listId: number;
  listTitle: string;
}

const DeleteListButton: React.FC<DeleteListButtonProps> = ({ listId, listTitle }) => {
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
          px: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }
        }}
      >
        Delete List
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