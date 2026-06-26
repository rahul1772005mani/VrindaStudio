// Footer.jsx - Bottom section of every page

import { Box, Container, Grid, Typography, IconButton, Divider, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

function Footer() {
  const navigate = useNavigate();
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* Column 1: Brand */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography sx={{ fontSize: '2rem' }}>🏷️</Typography>
              <Typography variant="h5" fontWeight={900}
                sx={{
                  background: 'linear-gradient(135deg, #9D97FF, #FF9999)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Vrinda Studio
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, lineHeight: 1.8 }}>
              Your one-stop shop for premium stickers! From Mangalore, Karnataka to your doorstep. 
              Quality stickers for every mood and occasion.
            </Typography>

            {/* Social Media Icons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <WhatsAppIcon />, color: '#25D366', label: 'WhatsApp' },
                { icon: <InstagramIcon />, color: '#E1306C', label: 'Instagram' },
                { icon: <FacebookIcon />, color: '#1877F2', label: 'Facebook' },
                { icon: <EmailIcon />, color: '#EA4335', label: 'Email' },
              ].map((social) => (
                <IconButton
                  key={social.label}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': { bgcolor: social.color, transform: 'translateY(-3px)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#9D97FF' }}>
              Quick Links
            </Typography>
            {['Home', 'All Stickers', 'New Arrivals', 'Trending', 'My Orders', 'My Profile'].map((link) => (
              <Typography
                key={link}
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  mb: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { color: '#9D97FF', paddingLeft: '4px' },
                  transition: 'all 0.2s ease',
                }}
              >
                → {link}
              </Typography>
            ))}
          </Grid>

          {/* Column 3: Categories */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#FF9999' }}>
              Categories
            </Typography>
            {['😂 Funny', '🐼 Cute', '🌸 Anime', '🦋 Nature', '🍕 Food', '⚽ Sports', '🏛️ Kannada', '🎮 Gaming', '🤡 Meme'].map((cat) => (
              <Typography
                key={cat}
                variant="body2"
                onClick={() => {
                  const parts = cat.split(' ');
                  const name = parts.length > 1 ? parts[1] : cat;
                  navigate(`/category/${name.toLowerCase()}`);
                }}
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { color: '#FF9999' },
                  transition: 'color 0.2s ease',
                }}
              >
                {cat}
              </Typography>
            ))}
          </Grid>

          {/* Column 4: Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#FFD93D' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
              <LocationOnIcon sx={{ color: '#FFD93D', fontSize: 20, mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Mangalore, Dakshina Kannada District,<br />
                Karnataka, India - 574201
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <PhoneIcon sx={{ color: '#FFD93D', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                +91 94838 79608
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ color: '#FFD93D', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                rahul1772005mani@gmail.com
              </Typography>
            </Box>

            {/* Delivery Info */}
            <Box sx={{
              mt: 2, p: 1.5, borderRadius: 2,
              bgcolor: 'rgba(108, 99, 255, 0.2)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
            }}>
              <Typography variant="caption" sx={{ color: '#9D97FF', fontWeight: 600, display: 'block' }}>
                🚚 Free delivery on orders above ₹299
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Delivers across India in 3-7 business days
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        {/* Bottom bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © 2025 Vrinda Studio. Made with ❤️ in Mangalore, Karnataka.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Return Policy', path: '/returns' },
              { label: 'Refund Policy', path: '/refund' },
              { label: 'Disclaimer', path: '/disclaimer' }
            ].map(link => (
              <Typography
                key={link.label}
                variant="caption"
                onClick={() => {
                  navigate(link.path);
                  window.scrollTo(0, 0);
                }}
                sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
