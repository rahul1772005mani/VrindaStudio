// Home.jsx - The main home page of Vrinda Studio
// Sections: Hero banner → Categories → Trending → New Arrivals → Features

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Chip, Button,
  Paper, Stack, Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StickerCard from '../components/StickerCard';
import { categories as localCategories, stickers as localStickers } from '../data/mockData';
import { supabase } from '../supabase';
import { useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [stickers, setStickers] = useState([]);
  const [categories, setCategories] = useState(localCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStickersAndCategories = async () => {
      try {
        setLoading(true);
        // 1. Fetch categories
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*');
        
        if (!catErr && catData && catData.length > 0) {
          const allCat = localCategories.find(c => c.id === 'all');
          const dbCats = catData.map(c => ({
            id: c.id,
            name: c.name,
            emoji: c.emoji,
            color: c.color,
            description: c.description || '',
            imageUrl: c.imageUrl
          }));
          setCategories([allCat, ...dbCats]);
        }

        // 2. Fetch stickers
        const { data, error } = await supabase
          .from('stickers')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setStickers(data);
        } else {
          setStickers(localStickers);
        }
      } catch (err) {
        console.error('Supabase fetch failed, falling back to mock data:', err);
        setStickers(localStickers);
      } finally {
        setLoading(false);
      }
    };
    fetchStickersAndCategories();
  }, []);

  const trendingStickers = stickers.filter(s => s.isTrending);
  const newStickers = stickers.filter(s => s.isNew);

  // Features shown in the feature bar
  const features = [
    { icon: <LocalShippingIcon />, title: 'Free Delivery', desc: 'On orders above ₹299', color: '#6C63FF' },
    { icon: <VerifiedIcon />, title: 'Premium Quality', desc: 'Waterproof vinyl stickers', color: '#10B981' },
    { icon: <HeadsetMicIcon />, title: '24/7 Support', desc: 'Always here to help', color: '#FF6B6B' },
    { icon: <CurrencyRupeeIcon />, title: 'Best Prices', desc: 'Starting from ₹29 only', color: '#F59E0B' },
  ];

  return (
    <Box className="fade-in">

      {/* ====== HERO SECTION ====== */}
      <Box sx={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 50%, #FFD93D 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        minHeight: { xs: 420, md: 520 },
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative floating emojis in background */}
        {['😂', '🐼', '🌸', '🦋', '🍕', '⚽', '🥳', '❤️', '🌈', '🎉'].map((emoji, i) => (
          <Typography
            key={i}
            sx={{
              position: 'absolute',
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              opacity: 0.15,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              left: `${(i * 11) % 95}%`,
              top: `${(i * 17) % 80}%`,
              userSelect: 'none',
            }}
          >
            {emoji}
          </Typography>
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container alignItems="center" spacing={4}>
            {/* Left: Text */}
            <Grid item xs={12} md={6}>
              <Chip
                label="🇮🇳 Made in Karnataka"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, mb: 2 }}
              />
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  mb: 2,
                }}
              >
                Stickers For<br />
                <Box component="span" sx={{
                  background: 'linear-gradient(90deg, #FFD93D, #fff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Every Mood!
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, mb: 4, maxWidth: 420 }}
              >
                Premium quality, waterproof stickers delivered to your door.
                Starting from just ₹29! 🚀
              </Typography>
              <Stack direction="row" gap={2} sx={{ flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/category/all')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 800,
                    px: 4,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-3px)' },
                  }}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/category/all')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' },
                  }}
                >
                  Browse All
                </Button>
              </Stack>
            </Grid>

            {/* Right: Big floating sticker emojis */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', height: 300, width: 300 }}>
                {[
                  { emoji: '😂', top: '0%', left: '0%', size: '4.5rem', delay: '0s' },
                  { emoji: '🐼', top: '0%', right: '0%', left: 'auto', size: '4.5rem', delay: '0.5s' },
                  { emoji: '🌸', top: '40%', left: '25%', size: '5.5rem', delay: '1s' },
                  { emoji: '🍕', bottom: '0%', top: 'auto', left: '0%', size: '4rem', delay: '1.5s' },
                  { emoji: '⚽', bottom: '0%', top: 'auto', right: '0%', left: 'auto', size: '4rem', delay: '2s' },
                ].map((item, i) => (
                  <Typography
                    key={i}
                    sx={{
                      position: 'absolute',
                      fontSize: item.size,
                      top: item.top || 'auto',
                      bottom: item.bottom || 'auto',
                      left: item.left || 'auto',
                      right: item.right || 'auto',
                      animation: 'float 3s ease-in-out infinite',
                      animationDelay: item.delay,
                      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
                    }}
                  >
                    {item.emoji}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ====== FEATURES BAR ====== */}
      <Box sx={{ bgcolor: 'white', py: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {features.map((f, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'center' } }}>
                  <Box sx={{
                    bgcolor: `${f.color}15`,
                    color: f.color,
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                  }}>
                    {f.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{f.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ====== CATEGORIES SECTION ====== */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="overline" color="primary" fontWeight={700}>SHOP BY</Typography>
            <Typography variant="h4" fontWeight={800}>Categories</Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/category/all')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            View All
          </Button>
        </Box>

        {/* Category chips / scroll */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <Paper
              key={cat.id}
              elevation={activeCategory === cat.id ? 4 : 1}
              onClick={() => {
                setActiveCategory(cat.id);
                navigate(`/category/${cat.id}`);
              }}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 90,
                border: '2px solid',
                borderColor: activeCategory === cat.id ? cat.color : 'transparent',
                bgcolor: activeCategory === cat.id ? `${cat.color}15` : 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: cat.color,
                  transform: 'translateY(-4px)',
                  bgcolor: `${cat.color}10`,
                },
              }}
            >
              {cat.imageUrl ? (
                <Box 
                  component="img" 
                  src={cat.imageUrl} 
                  sx={{ width: 36, height: 36, mb: 0.5, objectFit: 'contain' }} 
                />
              ) : (
                <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{cat.emoji}</Typography>
              )}
              <Typography variant="caption" fontWeight={700} color="text.primary">
                {cat.name}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* ====== TRENDING STICKERS ====== */}
      <Box sx={{ bgcolor: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="overline" color="error" fontWeight={700}>🔥 HOT RIGHT NOW</Typography>
              <Typography variant="h4" fontWeight={800}>Trending Stickers</Typography>
            </Box>
            <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/category/all')}>
              See All
            </Button>
          </Box>

          <Grid container spacing={3}>
            {trendingStickers.slice(0, 8).map((sticker) => (
              <Grid item xs={12} sm={6} md={3} key={sticker.id}>
                <StickerCard sticker={sticker} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ====== NEW ARRIVALS ====== */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="overline" color="success.main" fontWeight={700}>✨ JUST IN</Typography>
            <Typography variant="h4" fontWeight={800}>New Arrivals</Typography>
          </Box>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/category/all')}>
            See All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {newStickers.slice(0, 4).map((sticker) => (
            <Grid item xs={12} sm={6} md={3} key={sticker.id}>
              <StickerCard sticker={sticker} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ====== SPECIAL BANNER - KANNADA STICKERS ====== */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Paper sx={{
          p: { xs: 3, md: 5 },
          background: 'linear-gradient(135deg, #FF8C00 0%, #FF6B6B 100%)',
          color: 'white',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 3,
        }}>
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
              🏛️ Kannada Special Stickers!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Celebrating Karnataka's culture from Mangalore 🌺
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/category/kannada')}
            sx={{
              bgcolor: 'white',
              color: '#FF6B6B',
              fontWeight: 800,
              px: 4,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
            }}
          >
            Shop Karnataka Collection →
          </Button>
        </Paper>
      </Container>

    </Box>
  );
}

export default Home;
