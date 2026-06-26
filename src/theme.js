// theme.js - This file sets up the look and feel of our entire app
// Think of it as the "design rulebook" - colors, fonts, button shapes, etc.

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // COLORS - Our app's color palette
  palette: {
    primary: {
      main: '#6C63FF',      // Purple - main brand color
      light: '#9D97FF',     // Lighter purple for hover effects
      dark: '#4A42CC',      // Darker purple for active states
      contrastText: '#fff', // White text on purple buttons
    },
    secondary: {
      main: '#FF6B6B',      // Coral red - for accents
      light: '#FF9999',     // Lighter coral
      dark: '#CC4444',      // Darker coral
      contrastText: '#fff',
    },
    success: {
      main: '#10B981',      // Green - for success messages
    },
    warning: {
      main: '#F59E0B',      // Amber - for warnings
    },
    background: {
      default: '#F8F7FF',   // Very light purple tint background
      paper: '#FFFFFF',     // White for cards and surfaces
    },
    text: {
      primary: '#1A1A2E',   // Dark navy for main text
      secondary: '#64748B', // Gray for secondary text
    },
  },

  // TYPOGRAPHY - Fonts used throughout the app
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", sans-serif',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },

  // SHAPE - How round the corners are
  shape: {
    borderRadius: 16,
  },

  // COMPONENT OVERRIDES - Custom styles for specific MUI components
  components: {
    // Buttons - round pill shape
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,           // Very round
          textTransform: 'none',      // Don't make text ALL CAPS
          fontWeight: 600,
          padding: '10px 28px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(108, 99, 255, 0.35)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },

    // Cards - rounded with hover animation
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(108, 99, 255, 0.08)',
          transition: 'transform 0.35s ease, box-shadow 0.35s ease',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 20px 50px rgba(108, 99, 255, 0.2)',
          },
        },
      },
    },

    // Chips (category tags)
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif',
        },
      },
    },

    // Text fields (inputs)
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme;
