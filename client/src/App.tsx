import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { TodoProvider } from './context/TodoContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import CreateListPage from './pages/CreateListPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#004cad', // Added for hover effects
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TodoProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateListPage />} />
                <Route path="/list/:slug" element={<ListPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </TodoProvider>
    </ThemeProvider>
  );
}

export default App;
