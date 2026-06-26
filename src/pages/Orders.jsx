// Orders.jsx - Order tracking page
// Queries order tracking details from Supabase database for the logged-in Clerk user

import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Chip, Button, Stepper, Step, StepLabel, Grid,
  Divider, Stack, Avatar, CircularProgress, Paper,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabase';

// Order status steps
const orderSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

// Map status to step number
const statusToStep = {
  placed: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

// Status chip color
const statusColor = {
  placed: 'default',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
};

const statusIcon = {
  placed: <AccessTimeIcon sx={{ fontSize: 16 }} />,
  processing: <InventoryIcon sx={{ fontSize: 16 }} />,
  shipped: <LocalShippingIcon sx={{ fontSize: 16 }} />,
  delivered: <CheckCircleIcon sx={{ fontSize: 16 }} />,
};

function Orders() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) return;
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('userId', clerkUser.id)
          .order('createdAt', { ascending: false });
        
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isSignedIn, clerkUser]);

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Login Wall
  if (!isSignedIn) {
    return (
      <Box className="fade-in" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center', borderRadius: 4, boxShadow: '0 8px 32px rgba(108,99,255,0.08)' }}>
          <Typography sx={{ fontSize: '3.5rem', mb: 2 }}>📦</Typography>
          <Typography variant="h5" fontWeight={800} mb={1}>Login to Track Orders</Typography>
          <Typography color="text.secondary" mb={3}>
            Please log in to see your order history and live shipping updates.
          </Typography>
          <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')}>
            Login / Sign Up
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '4rem', mb: 2 }}>📦</Typography>
        <Typography variant="h5" fontWeight={700} mb={2}>No orders yet!</Typography>
        <Typography color="text.secondary" mb={4}>
          Start shopping to see your orders here.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          Shop Now
        </Button>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ bgcolor: 'white', py: 3, borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={800}>📦 My Orders</Typography>
          <Typography color="text.secondary">{orders.length} orders placed</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pb: 6 }}>
        <Stack spacing={3}>
          {orders.map((order) => {
            const orderAddress = typeof order.address === 'object'
              ? `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
              : order.address;
            const expectedDelivery = order.expectedDelivery || 'Calculated soon';

            return (
              <Card key={order.id} sx={{ borderRadius: 4, overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>

                  {/* Order header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} color="primary">
                        Order #{order.id.slice(0, 8)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Placed on {order.date}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      color={statusColor[order.status]}
                      icon={statusIcon[order.status]}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {/* Order tracking steps */}
                  <Stepper activeStep={statusToStep[order.status]} alternativeLabel sx={{ mb: 3 }}>
                    {orderSteps.map((label) => (
                      <Step key={label}>
                        <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem' } }}>
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  <Divider sx={{ mb: 2 }} />

                  {/* Items in this order */}
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
                    ITEMS ORDERED
                  </Typography>
                   {order.items.map((item, i) => {
                    const itemQty = item.quantity || item.qty || 1;
                    return (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={item.imageUrl || ''}
                            sx={{
                              bgcolor: '#F3F4F6',
                              fontSize: '1.2rem',
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              '& img': { objectFit: 'contain', p: 0.5 }
                            }}
                          >
                            {!item.imageUrl && item.emoji}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">Qty: {itemQty}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>₹{item.price * itemQty}</Typography>
                      </Box>
                    );
                  })}

                  {/* Tracking info if shipped or delivered */}
                  {(order.courierAgency || order.trackingId) && (
                    <Box sx={{ mt: 2.5, mb: 1, p: 2, bgcolor: '#F8F9FC', borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocalShippingIcon sx={{ color: '#6C63FF' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>
                            SHIPPING COURIER & TRACKING
                          </Typography>
                          <Typography variant="body2" fontWeight={750} color="text.primary">
                            Shipped via: {order.courierAgency || 'Standard Post'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            Tracking ID: {order.trackingId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      {order.trackingId && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingId);
                            alert('Tracking ID copied to clipboard! 📋');
                          }}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Copy Tracking ID
                        </Button>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Delivery info + total */}
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <LocalShippingIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Delivering to
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>{orderAddress}</Typography>
                          {order.status !== 'delivered' && (
                            <Typography variant="caption" color="primary">
                              Expected by {expectedDelivery}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">Order Total</Typography>
                      <Typography variant="h6" fontWeight={800} color="primary">₹{order.total}</Typography>
                    </Grid>
                  </Grid>

                  {/* Action buttons */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {order.status === 'delivered' && (
                      <Button variant="outlined" size="small" onClick={() => navigate('/')}>
                        Buy Again
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => {
                        const message = `Hello Vrinda Studio, I need help with my order #${order.id.slice(0, 8)}...`;
                        window.open(`https://wa.me/919483879608?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      sx={{
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#1ebe57',
                        }
                      }}
                    >
                      Need Help?
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
}

export default Orders;
