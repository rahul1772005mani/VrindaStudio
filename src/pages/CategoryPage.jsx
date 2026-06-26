// CategoryPage.jsx - Shows all stickers in a specific category
// URL: /category/funny OR /category/all OR /category/cute etc.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Chip, FormControl,
  Select, MenuItem, InputLabel, TextField, InputAdornment,
  Breadcrumbs, Link, Pagination, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import StickerCard from '../components/StickerCard';
import { categories as localCategories, stickers as localStickers } from '../data/mockData';
import { supabase } from '../supabase';

function CategoryPage() {
  const { categoryName } = useParams(); // Gets the category from URL
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [rawStickers, setRawStickers] = useState([]);
  const [categories, setCategories] = useState(localCategories);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Get current category info
  const currentCategory = categories.find(
    c => c.id.toLowerCase() === categoryName?.toLowerCase()
  ) || categories[0] || localCategories[0];

  // Load stickers and categories from Supabase on mount
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
          setRawStickers(data);
        } else {
          setRawStickers(localStickers);
        }
      } catch (err) {
        console.error('Error fetching data in CategoryPage from Supabase:', err);
        setRawStickers(localStickers);
      } finally {
        setLoading(false);
      }
    };
    fetchStickersAndCategories();
  }, []);

  // Set page to 1 when category changes
  useEffect(() => {
    setPage(1);
  }, [categoryName]);

  // Filter stickers by category
  const stickers = rawStickers.filter(s => {
    if (!categoryName || categoryName.toLowerCase() === 'all') return true;
    return s.category.toLowerCase() === categoryName.toLowerCase();
  });

  // Filter by search
  const filtered = stickers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tags.some(t => t.includes(searchQuery.toLowerCase()))
  );

  // Sort stickers
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default: return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
    }
  });

  // Paginate
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  return (
    <Box className="fade-in">
      {/* Page Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${currentCategory.color}22, ${currentCategory.color}44)`,
        borderBottom: `3px solid ${currentCategory.color}44`,
        py: 4,
      }}>
        <Container maxWidth="lg">
          {/* Breadcrumb: Home > Category */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon sx={{ fontSize: 16 }} /> Home
            </Link>
            <Typography color="text.primary" fontWeight={600}>
              {currentCategory.name}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {currentCategory.imageUrl ? (
              <Box 
                component="img" 
                src={currentCategory.imageUrl} 
                sx={{ width: 64, height: 64, objectFit: 'contain' }} 
              />
            ) : (
              <Typography sx={{ fontSize: '3rem' }}>{currentCategory.emoji}</Typography>
            )}
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {currentCategory.name} Stickers
              </Typography>
              <Typography color="text.secondary">
                {filtered.length} stickers found
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Category Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {categories.map(cat => (
            <Chip
              key={cat.id}
              avatar={cat.imageUrl ? (
                <Avatar 
                  src={cat.imageUrl} 
                  variant="rounded" 
                  sx={{ width: 20, height: 20, bgcolor: 'transparent', '& img': { objectFit: 'contain' } }} 
                />
              ) : undefined}
              label={cat.imageUrl ? cat.name : `${cat.emoji} ${cat.name}`}
              onClick={() => navigate(`/category/${cat.id}`)}
              variant={categoryName === cat.id ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 600,
                bgcolor: categoryName === cat.id ? cat.color : 'transparent',
                color: categoryName === cat.id ? 'white' : 'text.primary',
                borderColor: cat.color,
                '&:hover': { bgcolor: `${cat.color}20` },
              }}
            />
          ))}
        </Box>

        {/* Search + Sort Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stickers Grid */}
        {paginated.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginated.map(sticker => (
                <Grid item xs={12} sm={6} md={3} key={sticker.id}>
                  <StickerCard sticker={sticker} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, val) => setPage(val)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        ) : (
          // No results found
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
            <Typography variant="h5" fontWeight={700} mb={1}>No stickers found</Typography>
            <Typography color="text.secondary">Try a different search or category</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default CategoryPage;
