// StickerCard.jsx - The card component shown for each sticker
// This is one "LEGO block" - it's reused everywhere stickers are shown

import { useState } from 'react';
import {
  Card, CardContent, CardActions, Box, Typography,
  IconButton, Button, Chip, Rating, Tooltip,
  Snackbar, Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { useCart } from '../context/CartContext';

function StickerCard({ sticker }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // When user clicks "Add to Cart"
  const handleAddToCart = () => {
    addToCart(sticker);
    setSnackbarMsg(`${sticker.name} added to cart! 🛒`);
    setSnackbarOpen(true);
  };

  // When user clicks the heart icon
  const handleWishlist = () => {
    toggleWishlist(sticker);
    const msg = isInWishlist(sticker.id)
      ? `${sticker.name} removed from wishlist`
      : `${sticker.name} added to wishlist! ❤️`;
    setSnackbarMsg(msg);
    setSnackbarOpen(true);
  };

  // Calculate discount percentage
  const discountPercent = sticker.originalPrice
    ? Math.round(((sticker.originalPrice - sticker.price) / sticker.originalPrice) * 100)
    : null;

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Badges: NEW or TRENDING */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, display: 'flex', gap: 0.5, flexDirection: 'column' }}>
          {sticker.isNew && (
            <Chip
              label="NEW"
              size="small"
              icon={<NewReleasesIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: '#10B981', color: '#fff', fontWeight: 700, fontSize: '0.65rem',
                animation: 'pulse 2s infinite',
              }}
            />
          )}
          {sticker.isTrending && (
            <Chip
              label="HOT"
              size="small"
              icon={<WhatshotIcon sx={{ fontSize: 14 }} />}
              sx={{ bgcolor: '#FF6B6B', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}
            />
          )}
        </Box>

        {/* Discount badge */}
        {discountPercent && (
          <Box sx={{
            position: 'absolute', top: 12, right: 12, zIndex: 1,
            bgcolor: '#FF6B6B', color: '#fff', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
          }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, lineHeight: 1 }}>{discountPercent}%</Typography>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 600 }}>OFF</Typography>
          </Box>
        )}

        {/* Sticker Image Area (using Image or Emoji Fallback) */}
        <Box sx={{
          bgcolor: sticker.bgColor || '#F3F4F6',
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          pt: (sticker.isNew || sticker.isTrending) && !sticker.imageUrl ? 3 : 0,
          p: sticker.imageUrl ? 2 : 0,
        }}>
          {sticker.imageUrl ? (
            <Box
              component="img"
              src={sticker.imageUrl}
              alt={sticker.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transition: 'transform 0.35s ease',
                '&:hover': {
                  transform: 'scale(1.15)',
                },
              }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: '5rem',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {sticker.emoji}
            </Typography>
          )}
        </Box>

        {/* Card Content */}
        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          {/* Category chip */}
          <Chip
            label={sticker.category}
            size="small"
            sx={{
              mb: 1,
              bgcolor: 'primary.light',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />

          {/* Sticker Name */}
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
            {sticker.name}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Rating value={sticker.rating} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary">
              ({sticker.reviews})
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              ₹{sticker.price}
            </Typography>
            {sticker.originalPrice && (
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              >
                ₹{sticker.originalPrice}
              </Typography>
            )}
          </Box>

          {/* Stock warning */}
          {sticker.stock < 30 && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              ⚡ Only {sticker.stock} left!
            </Typography>
          )}
        </CardContent>

        {/* Action Buttons */}
        <CardActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
          {/* Add to Cart button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            fullWidth
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Add to Cart
          </Button>

          {/* Wishlist (heart) button */}
          <Tooltip title={isInWishlist(sticker.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton onClick={handleWishlist} size="small" sx={{
              bgcolor: isInWishlist(sticker.id) ? '#FFE4E4' : 'grey.100',
              '&:hover': { bgcolor: '#FFD0D0' },
            }}>
              {isInWishlist(sticker.id)
                ? <FavoriteIcon sx={{ color: '#FF6B6B', fontSize: 20 }} />
                : <FavoriteBorderIcon sx={{ fontSize: 20 }} />
              }
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Pop-up notification when adding to cart */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 3 }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

export default StickerCard;
