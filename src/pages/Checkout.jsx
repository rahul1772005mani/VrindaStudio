// Checkout.jsx - The checkout / payment page
// User fills address and payment details, then places order

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, TextField, Button,
  Paper, Divider, Stepper, Step, StepLabel, Radio,
  RadioGroup, FormControlLabel, FormControl, FormLabel,
  Alert, Chip, Stack,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../context/CartContext';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabase';
import { useEffect } from 'react';

// The 3 steps of checkout
const steps = ['Delivery Address', 'Payment Method', 'Order Confirmed!'];

function Checkout() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { cartItems, cartSubtotal, deliveryCharge, cartTotal, clearCart } = useCart();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderId, setOrderId] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  // Address form state
  const [address, setAddress] = useState({
    name: clerkUser?.fullName || '',
    phone: '',
    street: '',
    city: 'Mangalore',
    state: 'Karnataka',
    pincode: '574201',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Sync display name if user loads late
  useEffect(() => {
    if (clerkUser) {
      setAddress(prev => ({
        ...prev,
        name: prev.name || clerkUser.fullName || ''
      }));
    }
  }, [clerkUser]);

  // Load Razorpay Checkout SDK Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddressChange = (field) => (e) => {
    setAddress(prev => ({ ...prev, [field]: e.target.value }));
  };

  const processOrderInsert = async (finalPaymentMethod) => {
    try {
      setOrderLoading(true);
      
      const orderData = {
        userId: clerkUser.id,
        customerName: address.name,
        customerEmail: clerkUser.primaryEmailAddress?.emailAddress || '',
        phone: address.phone,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          emoji: item.emoji,
          imageUrl: item.imageUrl || null,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: cartSubtotal,
        deliveryCharge: deliveryCharge,
        total: cartTotal,
        paymentMethod: finalPaymentMethod,
        status: 'placed', // placed, processing, shipped, delivered
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };

      // 1. Add order to Supabase
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (orderError) throw orderError;
      setOrderId(insertedOrder.id);

      // 1.5 Add notification for order confirmation
      try {
        await supabase
          .from('notifications')
          .insert([{
            userId: clerkUser.id,
            title: 'Order Confirmed! 🛒',
            message: `Thank you! Your order #${insertedOrder.id.slice(0, 8)}... has been placed successfully.`
          }]);
      } catch (notifErr) {
        console.error('Failed to create checkout notification:', notifErr);
      }

      // 2. Decrement stock in Supabase stickers table
      for (const item of cartItems) {
        try {
          const { data: stickerData } = await supabase
            .from('stickers')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (stickerData) {
            const newStock = Math.max(0, (stickerData.stock || 0) - item.quantity);
            await supabase
              .from('stickers')
              .update({ stock: newStock })
              .eq('id', item.id);
          }
        } catch (stockErr) {
          console.error(`Failed to update stock for sticker ${item.id}:`, stockErr);
        }
      }

      // 3. Complete Checkout step
      setActiveStep(2);
      clearCart();
    } catch (err) {
      console.error('Checkout database insertion failed:', err);
      alert('Failed to place order: ' + err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isSignedIn || !clerkUser) return;
    
    if (paymentMethod === 'cod') {
      await processOrderInsert('Cash on Delivery');
    } else {
      try {
        setOrderLoading(true);
        if (!window.Razorpay) {
          alert('Razorpay SDK is not loaded yet. Please wait a moment or check your internet connection.');
          setOrderLoading(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_zOOCJk7iM0pXG0',
          amount: cartTotal * 100, // in paise
          currency: 'INR',
          name: 'Vrinda Studio',
          description: 'Checkout Payment',
          image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&q=80',
          handler: async function (response) {
            const paymentId = response.razorpay_payment_id;
            await processOrderInsert(`Razorpay (ID: ${paymentId})`);
          },
          prefill: {
            name: address.name,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            contact: address.phone,
          },
          notes: {
            address: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`
          },
          theme: {
            color: '#6C63FF',
          },
          modal: {
            ondismiss: function () {
              setOrderLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Razorpay payment gateway failed to open:', err);
        alert('Payment process failed to start: ' + err.message);
        setOrderLoading(false);
      }
    }
  };

  // If cart is empty, redirect
  if (cartItems.length === 0 && activeStep !== 2) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" mb={3}>Your cart is empty!</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Shop Now</Button>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ bgcolor: 'white', py: 3, borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={800}>Checkout</Typography>

          {/* Step progress bar */}
          <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pb: 6 }}>
        <Grid container spacing={4}>

          {/* MAIN CONTENT (changes based on step) */}
          <Grid item xs={12} md={7}>

            {/* ---- STEP 1: ADDRESS ---- */}
            {activeStep === 0 && (
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>Delivery Address</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Full Name" required
                      value={address.name} onChange={handleAddressChange('name')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Phone Number" required
                      value={address.phone} onChange={handleAddressChange('phone')}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label="Street Address / House No." required multiline rows={2}
                      value={address.street} onChange={handleAddressChange('street')}
                      placeholder="e.g. #12, Main Road, Near Bus Stand"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth label="City" required
                      value={address.city} onChange={handleAddressChange('city')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth label="State"
                      value={address.state} onChange={handleAddressChange('state')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth label="Pincode" required
                      value={address.pincode} onChange={handleAddressChange('pincode')}
                      inputProps={{ maxLength: 6 }}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained" fullWidth size="large"
                  onClick={() => setActiveStep(1)}
                  disabled={!address.name || !address.phone || !address.street}
                  sx={{ mt: 3, py: 1.5 }}
                >
                  Continue to Payment →
                </Button>
              </Paper>
            )}

            {/* ---- STEP 2: PAYMENT ---- */}
            {activeStep === 1 && (
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PaymentIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>Payment Method</Typography>
                </Box>

                <FormControl>
                  <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    {[
                      { value: 'upi', label: '📲 UPI (Google Pay, PhonePe, Paytm)', desc: 'Instant payment, no charges' },
                      { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                      { value: 'card', label: '💳 Debit/Credit Card', desc: 'Visa, Mastercard, RuPay' },
                    ].map(option => (
                      <Box
                        key={option.value}
                        onClick={() => setPaymentMethod(option.value)}
                        sx={{
                          border: '2px solid',
                          borderColor: paymentMethod === option.value ? 'primary.main' : 'divider',
                          borderRadius: 3, p: 2, mb: 2, cursor: 'pointer',
                          bgcolor: paymentMethod === option.value ? 'primary.light' + '11' : 'white',
                          transition: 'all 0.2s',
                        }}
                      >
                        <FormControlLabel
                          value={option.value}
                          control={<Radio color="primary" />}
                          label={
                            <Box>
                              <Typography fontWeight={700}>{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{option.desc}</Typography>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>

                {paymentMethod === 'upi' && (
                  <Alert severity="info" sx={{ borderRadius: 2, mt: 1, mb: 2 }}>
                    You'll get a UPI payment link after confirming the order.
                  </Alert>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ flex: 1 }}>
                    ← Back
                  </Button>
                  <Button
                    variant="contained" size="large"
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                    sx={{ flex: 2, py: 1.5, fontWeight: 800 }}
                  >
                    {orderLoading ? 'Placing Order...' : `Place Order ₹${cartTotal}`}
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* ---- STEP 3: SUCCESS ---- */}
            {activeStep === 2 && (
              <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" fontWeight={900} mb={1}>
                  Order Placed! 🎉
                </Typography>
                <Typography color="text.secondary" mb={1}>
                  Thank you, {address.name}!
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  Your stickers will be delivered to<br />
                  <strong>{address.street}, {address.city} - {address.pincode}</strong>
                </Typography>

                <Chip
                  label={`Order #${orderId || 'SUCCESS'}`}
                  color="primary"
                  sx={{ mb: 3, fontWeight: 700, fontSize: '0.85rem', p: 2 }}
                />

                <Alert severity="info" sx={{ borderRadius: 2, mb: 3, textAlign: 'left' }}>
                  📦 Expected delivery in <strong>3-7 business days</strong>
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined" fullWidth
                    onClick={() => navigate('/orders')}
                  >
                    Track Order
                  </Button>
                  <Button
                    variant="contained" fullWidth
                    onClick={() => navigate('/')}
                  >
                    Shop More 🛒
                  </Button>
                </Stack>
              </Paper>
            )}
          </Grid>

          {/* ORDER SUMMARY (right column) */}
          {activeStep !== 2 && (
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Order Summary
                </Typography>

                {cartItems.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: 1, bgcolor: item.bgColor || '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        p: item.imageUrl ? 0.2 : 0, flexShrink: 0
                      }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">×{item.quantity}</Typography>
                      </Box>
                    </Box>
                    <Typography fontWeight={600}>₹{item.price * item.quantity}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>₹{cartSubtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Delivery</Typography>
                  <Typography>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={800}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary">₹{cartTotal}</Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default Checkout;
