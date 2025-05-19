import React from 'react';
import { Alert, Box, Paper } from '@mui/material';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Box sx={{ my: 2 }}>
      <Paper elevation={0}>
        <Alert severity="error">{message}</Alert>
      </Paper>
    </Box>
  );
};

export default ErrorMessage;
