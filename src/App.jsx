// App.jsx - The ROOT of our app. This file connects ALL pages together.
// Think of it as the "main building" and all pages are "rooms" inside it.

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { CartProvider } from './context/CartContext';
import { ClerkProvider } from '@clerk/clerk-react';

// Components (shown on EVERY page)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Policies from './pages/Policies';

// Clerk Publishable Key (fallback to placeholder so it doesn't crash before setup)
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_cHVibGlzaGFibGUtcGxhY2Vob2xkZXItd2l0aC12YWxpZC1mb3JtYXQuY2xlcmsuYWNjb3VudHMk';

function ClerkProviderWithNavigate({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

function App() {
  return (
    // ThemeProvider: Applies our custom colors/fonts throughout the app
    <ThemeProvider theme={theme}>
      {/* CssBaseline: Resets browser default styles for consistency */}
      <CssBaseline />

      {/* Router: Enables navigation between pages */}
      <Router>
        {/* ClerkProviderWithNavigate: Integrates Clerk Authentication with React Router */}
        <ClerkProviderWithNavigate>
          {/* CartProvider: Makes cart data available on ALL pages */}
          <CartProvider>
            {/* Navbar is shown on TOP of every page */}
            <Navbar />

            {/* Routes: Shows different pages based on the URL */}
            <Routes>
              <Route path="/"                      element={<Home />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/cart"                   element={<Cart />} />
              <Route path="/checkout"               element={<Checkout />} />
              <Route path="/orders"                 element={<Orders />} />
              <Route path="/profile"                element={<Profile />} />
              <Route path="/login"                  element={<Login />} />
              <Route path="/admin"                  element={<AdminDashboard />} />
              <Route path="/privacy"                element={<Policies tab="privacy" />} />
              <Route path="/refund"                 element={<Policies tab="refund" />} />
              <Route path="/returns"                element={<Policies tab="returns" />} />
              <Route path="/disclaimer"             element={<Policies tab="disclaimer" />} />
            </Routes>

            {/* Footer is shown at the BOTTOM of every page */}
            <Footer />
          </CartProvider>
        </ClerkProviderWithNavigate>
      </Router>
    </ThemeProvider>
  );
}

export default App;
