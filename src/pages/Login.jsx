// Login.jsx - Login and Sign Up page using Clerk Authentication
// Centers Clerk's secure and modern Sign In widget

import { SignIn } from '@clerk/clerk-react';
import { Box, Container, Typography } from '@mui/material';

function Login() {
  return (
    <Box
      className="fade-in"
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6C63FF11 0%, #FF6B6B11 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: '3rem' }}>🏷️</Typography>
          <Typography variant="h4" fontWeight={900}
            sx={{
              background: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Vrinda Studio
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Secure login for your Vrinda Studio account
          </Typography>
        </Box>

        {/* Clerk Sign-In Widget */}
        <Box sx={{
          boxShadow: '0 20px 40px rgba(108,99,255,0.08)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <SignIn
            signUpUrl={undefined} // Clerk automatically toggles within the widget
            fallbackRedirectUrl="/"
          />
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
