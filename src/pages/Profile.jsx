// Profile.jsx - User profile page with wishlist and order stats
// Integrates with Clerk for authentication and Supabase for order history

import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Avatar, Button, Divider, Paper, Stack, Tab, Tabs,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabase';
import StickerCard from '../components/StickerCard';

function Profile() {
  const navigate = useNavigate();
  const { wishlist } = useCart();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const [tab, setTab] = useState(0);
  const [userOrders, setUserOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) return;
    const fetchUserStats = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('userId', clerkUser.id);
        
        if (error) throw error;
        setUserOrders(data || []);
      } catch (err) {
        console.error('Error fetching user orders from Supabase:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchUserStats();
  }, [isSignedIn, clerkUser]);

  // Show loading indicator while Clerk initializes
  if (!isLoaded) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1">Loading profile...</Typography>
      </Box>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return (
      <Box className="fade-in" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center', borderRadius: 4, boxShadow: '0 8px 32px rgba(108,99,255,0.08)' }}>
          <Typography sx={{ fontSize: '3.5rem', mb: 2 }}>👤</Typography>
          <Typography variant="h5" fontWeight={800} mb={1}>Access Denied</Typography>
          <Typography color="text.secondary" mb={3}>
            Please log in or sign up to view your profile, track orders, and see your wishlist items.
          </Typography>
          <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')}>
            Login / Sign Up
          </Button>
        </Paper>
      </Box>
    );
  }

  // Format member date
  const creationTime = clerkUser.createdAt;
  const joinDate = creationTime 
    ? new Date(creationTime).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  const user = {
    name: clerkUser.fullName || 'Sticker Lover',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    location: 'Mangalore, Karnataka',
    joinDate: joinDate,
    totalOrders: userOrders.length,
    totalSpent: totalSpent,
    avatar: clerkUser.imageUrl || '',
    initial: clerkUser.firstName ? clerkUser.firstName.charAt(0).toUpperCase() : 'S',
  };

  return (
    <Box className="fade-in">
      {/* Profile Header Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
        pt: 6, pb: 10, px: 2,
      }} />

      <Container maxWidth="md" sx={{ mt: -8, pb: 6 }}>

        {/* Profile Card */}
        <Paper sx={{ borderRadius: 4, p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {/* Avatar */}
            <Avatar 
              src={user.avatar}
              sx={{
                width: 80, height: 80,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                fontWeight: 800,
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
              }}
            >
              {user.initial}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={800}>{user.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{user.location}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">Member since {user.joinDate}</Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Grid container spacing={2}>
            {[
              { label: 'Orders Placed', value: statsLoading ? '...' : user.totalOrders, icon: '📦' },
              { label: 'Total Spent', value: statsLoading ? '...' : `₹${user.totalSpent}`, icon: '💰' },
              { label: 'Wishlist Items', value: wishlist.length, icon: '❤️' },
            ].map(stat => (
              <Grid item xs={4} key={stat.label}>
                <Box sx={{
                  textAlign: 'center', p: 2,
                  bgcolor: 'background.default', borderRadius: 3,
                }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>{stat.icon}</Typography>
                  <Typography variant="h5" fontWeight={900} color="primary">{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Tabs: Profile Info | Wishlist */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant="fullWidth"
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Tab label="Account Info" />
            <Tab label={`My Wishlist (${wishlist.length})`} icon={<FavoriteIcon sx={{ fontSize: 18 }} />} iconPosition="end" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* ACCOUNT INFO TAB */}
            {tab === 0 && (
              <Stack spacing={2}>
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Email Address', value: user.email },
                  { label: 'Default City', value: user.location },
                ].map(field => (
                  <Box key={field.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {field.label.toUpperCase()}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>{field.value}</Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Stack>
            )}

            {/* WISHLIST TAB */}
            {tab === 1 && (
              <>
                {wishlist.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>💔</Typography>
                    <Typography variant="h6" fontWeight={700} mb={1}>Your wishlist is empty</Typography>
                    <Typography color="text.secondary" mb={3}>
                      Click the ❤️ on any sticker to save it here!
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')}>
                      Browse Stickers
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {wishlist.map(sticker => (
                      <Grid item xs={12} sm={6} key={sticker.id}>
                        <StickerCard sticker={sticker} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
        </Paper>

        {/* View Orders Button */}
        <Button
          fullWidth variant="outlined"
          startIcon={<LocalMallIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 3, py: 1.5, borderRadius: 3 }}
        >
          View My Orders
        </Button>
      </Container>
    </Box>
  );
}

export default Profile;
