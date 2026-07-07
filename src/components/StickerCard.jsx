// StickerCard.jsx - The card component shown for each sticker
// This is one "LEGO block" - it's reused everywhere stickers are shown

import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardActions, Box, Typography,
  IconButton, Button, Chip, Rating, Tooltip,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Avatar, Divider
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CloseIcon from '@mui/icons-material/Close';
import { useCart } from '../context/CartContext';

function StickerCard({ sticker }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(sticker.imageUrl || '');
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    if (sticker) {
      setActiveImage(sticker.imageUrl || '');
    }
  }, [sticker]);

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
        <Box 
          onClick={() => setDetailOpen(true)}
          sx={{
            bgcolor: sticker.bgColor || '#F3F4F6',
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            pt: (sticker.isNew || sticker.isTrending) && !sticker.imageUrl ? 3 : 0,
            p: sticker.imageUrl ? 2 : 0,
          }}
        >
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
          <Typography 
            variant="h6" 
            onClick={() => setDetailOpen(true)}
            sx={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              mb: 0.5, 
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
          >
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

      {/* ===== STICKER DETAIL POPUP DIALOG WITH HOVER ZOOM ===== */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, pb: 1 }}>
          <span>Product Details</span>
          <IconButton size="small" onClick={() => setDetailOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 4 } }}>
          <Grid container spacing={4}>
            {/* Left Column: Interactive Image Gallery & Magnifier */}
            <Grid item xs={12} sm={5}>
              <Box
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                onMouseMove={handleMouseMove}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 260, sm: 320 },
                  bgcolor: sticker.bgColor || '#F3F4F6',
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  p: activeImage ? 2 : 0,
                }}
              >
                {activeImage ? (
                  <Box
                    component="img"
                    src={activeImage}
                    alt={sticker.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transform: zoom ? 'scale(2.2)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transition: zoom ? 'none' : 'transform 0.25s ease-out',
                    }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '6rem' }}>{sticker.emoji}</Typography>
                )}
              </Box>

              {/* Gallery thumbnails */}
              {sticker.images && sticker.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', py: 0.5 }}>
                  {sticker.images.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: activeImage === img ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        bgcolor: '#fff',
                        p: 0.2,
                        flexShrink: 0,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.light' }
                      }}
                    >
                      <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Right Column: Information & Description */}
            <Grid item xs={12} sm={7}>
              <Stack spacing={2.5}>
                <Box>
                  {/* Category Chip */}
                  <Chip
                    label={sticker.category}
                    size="small"
                    sx={{
                      mb: 1.5,
                      bgcolor: 'primary.light',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  />
                  <Typography variant="h5" fontWeight={900} color="text.primary">
                    {sticker.name}
                  </Typography>
                </Box>

                {/* Rating & Review */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={sticker.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {sticker.rating} stars • ({sticker.reviews} reviews)
                  </Typography>
                </Box>

                <Divider />

                {/* Description */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={850} color="text.primary" mb={0.5}>
                    Product Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {sticker.description || 'No description available for this premium sticker item. Made with high-quality vinyl backing and vibrant colors.'}
                  </Typography>
                </Box>

                {/* Tags List */}
                {sticker.tags && sticker.tags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={850} color="text.primary" mb={0.8}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {sticker.tags.map((tag) => (
                        <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Dialog Actions Footer: Price details & CTA Buttons */}
        <DialogActions 
          sx={{ 
            px: { xs: 2, sm: 4 }, 
            py: 2.5, 
            bgcolor: '#F9FAFB', 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}
        >
          {/* Left Side: Price and Stock details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
              <Typography variant="h5" fontWeight={900} color="primary.main">
                ₹{sticker.price}
              </Typography>
              {sticker.originalPrice && (
                <>
                  <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 500 }}>
                    ₹{sticker.originalPrice}
                  </Typography>
                  <Chip
                    label={`${discountPercent}% OFF`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem', height: 16 }}
                  />
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sticker.stock > 0 ? 'success.main' : 'error.main' }} />
              <Typography variant="caption" fontWeight={700} color={sticker.stock > 0 ? 'success.main' : 'error.main'}>
                {sticker.stock > 0 ? `In Stock (${sticker.stock} pieces left)` : 'Out of Stock'}
              </Typography>
            </Box>
          </Box>

          {/* Right Side: CTA Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title={isInWishlist(sticker.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
              <IconButton 
                onClick={handleWishlist} 
                size="large" 
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  bgcolor: isInWishlist(sticker.id) ? '#FFE4E4' : '#fff',
                  '&:hover': { bgcolor: '#FFD0D0' },
                  width: 48,
                  height: 48,
                }}
              >
                {isInWishlist(sticker.id)
                  ? <FavoriteIcon sx={{ color: '#FF6B6B' }} />
                  : <FavoriteBorderIcon />
                }
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={() => {
                handleAddToCart();
                setDetailOpen(false);
              }}
              fullWidth={{ xs: true, sm: false }}
              sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 3, textTransform: 'none', boxShadow: '0 4px 14px rgba(108,99,255,0.25)' }}
            >
              Add to Cart
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StickerCard;
