// Cart.jsx - Shopping cart page
// Shows all items user added, lets them change quantity or remove items

import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  IconButton, Button, Divider, TextField, Paper, Chip,
  Stack, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useCart } from '../context/CartContext';

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems, cartCount, cartSubtotal,
    deliveryCharge, cartTotal,
    removeFromCart, updateQuantity, clearCart,
  } = useCart();

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <Box className="fade-in" sx={{ py: 10, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '5rem', mb: 2 }}>🛒</Typography>
        <Typography variant="h4" fontWeight={800} mb={2}>Your cart is empty!</Typography>
        <Typography color="text.secondary" mb={4}>
          Add some awesome stickers to get started!
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{ px: 6 }}
        >
          Browse Stickers
        </Button>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ bgcolor: 'white', py: 3, borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={800}>
            🛒 Shopping Cart
            <Chip label={`${cartCount} items`} color="primary" sx={{ ml: 2, fontWeight: 700 }} />
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Grid container spacing={4}>

          {/* LEFT: Cart Items List */}
          <Grid item xs={12} md={8}>
            {/* Free delivery info */}
            {deliveryCharge > 0 && (
              <Alert
                severity="info"
                icon={<LocalShippingIcon />}
                sx={{ mb: 3, borderRadius: 3 }}
              >
                Add ₹{299 - cartSubtotal} more to get <strong>FREE delivery!</strong>
              </Alert>
            )}
            {deliveryCharge === 0 && (
              <Alert severity="success" icon={<LocalShippingIcon />} sx={{ mb: 3, borderRadius: 3 }}>
                🎉 You've unlocked <strong>FREE delivery!</strong>
              </Alert>
            )}

            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Card key={item.id} sx={{ p: 0 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                      {/* Sticker image or emoji */}
                      <Box sx={{
                        bgcolor: item.bgColor || '#F3F4F6',
                        width: 80, height: 80,
                        borderRadius: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        p: item.imageUrl ? 1 : 0,
                      }}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: '2.5rem' }}>{item.emoji}</Typography>
                        )}
                      </Box>

                      {/* Item info */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                        <Typography variant="h6" color="primary" fontWeight={800} sx={{ mt: 0.5 }}>
                          ₹{item.price}
                        </Typography>
                      </Box>

                      {/* Quantity controls */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>

                        <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Item total */}
                      <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                        <Typography variant="h6" fontWeight={800} color="primary">
                          ₹{item.price * item.quantity}
                        </Typography>
                        {/* Delete button */}
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ color: 'error.main', mt: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* Clear cart button */}
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
              sx={{ mt: 2 }}
            >
              Clear Cart
            </Button>
          </Grid>

          {/* RIGHT: Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, position: 'sticky', top: 90 }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Order Summary</Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Subtotal ({cartCount} items)</Typography>
                  <Typography fontWeight={600}>₹{cartSubtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Delivery</Typography>
                  {deliveryCharge === 0 ? (
                    <Chip label="FREE" size="small" color="success" sx={{ fontWeight: 700 }} />
                  ) : (
                    <Typography fontWeight={600}>₹{deliveryCharge}</Typography>
                  )}
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={800}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary">₹{cartTotal}</Typography>
                </Box>
              </Stack>

              {/* Savings info */}
              {cartItems.some(item => item.originalPrice) && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="success.dark">
                    💰 You save ₹{cartItems.reduce((acc, item) => {
                      return acc + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0);
                    }, 0)}!
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/checkout')}
                sx={{ mt: 3, py: 1.5, fontWeight: 800 }}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={() => navigate('/')}
                sx={{ mt: 1 }}
              >
                ← Continue Shopping
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Cart;
