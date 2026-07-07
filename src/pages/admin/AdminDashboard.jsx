// AdminDashboard.jsx - Premium Admin panel for managing Vrinda Studio store
// Features: Overview, Add stickers, manage stock, view orders, payment ledger, database seeding, image uploads

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, TextField, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  IconButton, Avatar, Stack, Divider, Select, MenuItem,
  FormControl, InputLabel, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  ToggleButtonGroup, ToggleButton, Tooltip, Snackbar,
  InputAdornment, List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentsIcon from '@mui/icons-material/Payments';
import DatabaseIcon from '@mui/icons-material/Storage';
import LockIcon from '@mui/icons-material/Lock';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AlertCircleIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import PrintIcon from '@mui/icons-material/Print';

// Supabase and Clerk
import { supabase } from '../../supabase';
import { seedDatabase } from '../../data/seeder';
import { useUser, SignIn, useClerk } from '@clerk/clerk-react';
import StickerCard from '../../components/StickerCard';

const statusColors = { placed: 'default', processing: 'warning', shipped: 'info', delivered: 'success' };

function AdminDashboard() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  // Tab State: 0=Overview, 1=Add Sticker, 2=Manage Stock, 3=Orders, 4=Payments, 5=Settings
  const [tab, setTab] = useState(0);
  const [stickers, setStickers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedingMessage, setSeedingMessage] = useState('');

  // Searching & Filtering states
  const [stickerSearch, setStickerSearch] = useState('');
  const [stickerCategory, setStickerCategory] = useState('all');
  const [inventoryViewMode, setInventoryViewMode] = useState('table'); // 'table' or 'grid'

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Form image input states
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' or 'file'
  const [editImageInputMode, setEditImageInputMode] = useState('url'); // 'url' or 'file'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // New sticker form
  const [newSticker, setNewSticker] = useState({
    name: '', emoji: '', category: 'Funny',
    price: '', stock: '', description: '', imageUrl: '',
    images: []
  });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [editImageUrlInput, setEditImageUrlInput] = useState('');

  // Dialog and Notifications states
  const [editingSticker, setEditingSticker] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // States for Order Inspection Logistics Panel
  const [inspectStatus, setInspectStatus] = useState('');
  const [inspectCourier, setInspectCourier] = useState('');
  const [inspectTracking, setInspectTracking] = useState('');

  // Snackbar Notification State
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'info' | 'warning' | 'error'
  });

  // Database schema missing status
  const [dbMissing, setDbMissing] = useState(false);

  // Dynamic categories state (loaded from Supabase categories table)
  const [categoriesState, setCategoriesState] = useState([
    { id: 'funny', name: 'Funny', emoji: '😂', color: '#FF6B6B', description: 'Hilarious stickers' },
    { id: 'cute', name: 'Cute', emoji: '🐼', color: '#FF8FAB', description: 'Adorable stickers' },
    { id: 'anime', name: 'Anime', emoji: '🌸', color: '#A78BFA', description: 'Japanese anime style' },
    { id: 'nature', name: 'Nature', emoji: '🦋', color: '#10B981', description: 'Natural world stickers' },
    { id: 'food', name: 'Food', emoji: '🍕', color: '#F59E0B', description: 'Delicious food stickers' },
    { id: 'sports', name: 'Sports', emoji: '⚽', color: '#3B82F6', description: 'Sports & games stickers' },
    { id: 'kannada', name: 'Kannada', emoji: '🏛️', color: '#EF4444', description: 'Karnataka special stickers' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮', color: '#10B981', description: 'Gaming & console stickers' },
    { id: 'meme', name: 'Meme', emoji: '🤡', color: '#F59E0B', description: 'Internet memes & jokes' },
  ]);

  // Form input state for adding new category
  const [newCategory, setNewCategory] = useState({
    name: '', emoji: '', color: '#6C63FF', description: '', imageUrl: ''
  });
  const [editingCategory, setEditingCategory] = useState(null);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setDbMissing(false);

      // Fetch stickers from Supabase
      const { data: stickersData, error: stickersErr } = await supabase
        .from('stickers')
        .select('*');

      if (stickersErr) {
        if (stickersErr.code === 'PGRST205' || stickersErr.code === '42P01') {
          setDbMissing(true);
        }
        throw stickersErr;
      }

      // Sort stickers by ID locally to match storefront ordering
      const sortedStickers = (stickersData || []).sort((a, b) => a.id - b.id);
      setStickers(sortedStickers);

      // Fetch categories from Supabase
      const { data: categoriesData, error: categoriesErr } = await supabase
        .from('categories')
        .select('*');
      
      if (!categoriesErr && categoriesData && categoriesData.length > 0) {
        setCategoriesState(categoriesData);
      }

      // Fetch orders from Supabase (sorted by newest first)
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });

      if (ordersErr) {
        if (ordersErr.code === 'PGRST205' || ordersErr.code === '42P01') {
          setDbMissing(true);
        }
        throw ordersErr;
      }
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Error fetching admin data from Supabase:', err);
      if (err.code === 'PGRST205' || err.code === '42P01') {
        showToast('Database tables not found! Please run schema.sql in Supabase SQL Editor.', 'error');
      } else {
        showToast('Error loading database data: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'rahul1772005mani@gmail.com,admin@vrindastudio.com').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = isSignedIn && userEmail && adminEmails.includes(userEmail.toLowerCase());

    if (isAdmin) {
      fetchData();
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (selectedOrder) {
      setInspectStatus(selectedOrder.status || 'placed');
      setInspectCourier(selectedOrder.courierAgency || '');
      setInspectTracking(selectedOrder.trackingId || '');
    }
  }, [selectedOrder]);

  const handleFileUpload = async (event, isEdit = false) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError('');

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stickers/${fileName}`;

      // Upload file to Supabase Storage bucket 'sticker-images'
      const { data, error } = await supabase.storage
        .from('sticker-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sticker-images')
        .getPublicUrl(filePath);

      if (isEdit) {
        setEditingSticker(p => {
          const images = [...(p.images || []), publicUrl];
          return {
            ...p,
            images,
            imageUrl: p.imageUrl || publicUrl
          };
        });
        showToast('Image uploaded and added to sticker gallery!', 'success');
      } else {
        setNewSticker(p => {
          const images = [...(p.images || []), publicUrl];
          return {
            ...p,
            images,
            imageUrl: p.imageUrl || publicUrl
          };
        });
        showToast('Image uploaded and added to sticker gallery!', 'success');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(
        'Storage upload failed! Please create a public bucket named "sticker-images" in your Supabase storage, or paste a direct image URL instead.'
      );
      showToast('Upload failed! Please check your storage settings.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const [categoryUploading, setCategoryUploading] = useState(false);
  const [categoryUploadError, setCategoryUploadError] = useState('');

  const handleCategoryFileUpload = async (event, isEdit = false) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setCategoryUploading(true);
      setCategoryUploadError('');

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload file to Supabase Storage bucket 'sticker-images'
      const { data, error } = await supabase.storage
        .from('sticker-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sticker-images')
        .getPublicUrl(filePath);

      if (isEdit) {
        setEditingCategory(p => ({ ...p, imageUrl: publicUrl }));
        showToast('Category image uploaded for editing!', 'success');
      } else {
        setNewCategory(p => ({ ...p, imageUrl: publicUrl }));
        showToast('Category image uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Category upload failed:', err);
      setCategoryUploadError('Storage upload failed! Please check your storage settings or paste an image URL.');
      showToast('Category upload failed! Check storage settings.', 'error');
    } finally {
      setCategoryUploading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setSeedingLoading(true);
      setSeedingMessage('');
      const seeded = await seedDatabase();
      if (seeded) {
        setSeedingMessage('✅ Database seeded with 20 premium stickers successfully!');
        showToast('Database seeded successfully!', 'success');
        await fetchData();
      } else {
        setSeedingMessage('ℹ️ Database already has stickers. No seeding needed.');
        showToast('Database already seeded.', 'info');
      }
    } catch (err) {
      setSeedingMessage('❌ Seeding failed: ' + err.message);
      showToast('Seeding failed: ' + err.message, 'error');
    } finally {
      setSeedingLoading(false);
    }
  };

  const handleAddSticker = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const stickerPayload = {
        name: newSticker.name,
        emoji: newSticker.emoji,
        category: newSticker.category,
        price: parseInt(newSticker.price),
        stock: parseInt(newSticker.stock),
        description: newSticker.description,
        imageUrl: newSticker.imageUrl || null,
        images: newSticker.images || [],
        originalPrice: null,
        bgColor: '#F3F4F6',
        rating: 5.0,
        reviews: 0,
        isNew: true,
        isTrending: false,
        tags: [],
      };

      const { error } = await supabase
        .from('stickers')
        .insert([stickerPayload]);

      if (error) throw error;

      setNewSticker({ name: '', emoji: '', category: 'Funny', price: '', stock: '', description: '', imageUrl: '', images: [] });
      setImageUrlInput('');
      showToast('Sticker added successfully!', 'success');
      await fetchData();
    } catch (err) {
      console.error('Failed to add sticker to Supabase:', err);
      showToast('Failed to add sticker: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const targetOrder = orders.find(o => o.id === orderId);
      if (!targetOrder) return;

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      showToast(`Order status updated to "${newStatus}"!`, 'success');
      await fetchData();

      // If we are viewing details, update the active dialog status too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        setInspectStatus(newStatus);
      }

      // Add notification for the customer
      let title = 'Order Update 📦';
      let message = `Your order #${orderId.slice(0, 8)}... status is now "${newStatus.toUpperCase()}".`;
      
      if (newStatus === 'processing') {
        title = 'Order Processing ⚙️';
        message = `Your order #${orderId.slice(0, 8)}... is now being packaged and prepared.`;
      } else if (newStatus === 'shipped') {
        title = 'Order Shipped! 🚚';
        message = `Your order #${orderId.slice(0, 8)}... has been dispatched. Check order details for tracking info.`;
      } else if (newStatus === 'delivered') {
        title = 'Order Delivered! 🎉';
        message = `Your order #${orderId.slice(0, 8)}... has been successfully delivered.`;
      }

      await supabase
        .from('notifications')
        .insert([{
          userId: targetOrder.userId,
          title,
          message
        }]);

    } catch (err) {
      console.error('Failed to update order status in Supabase:', err);
      showToast('Failed to update order status: ' + err.message, 'error');
    }
  };

  const handleSaveShippingDetails = async (orderId, status, courierAgency, trackingId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          courierAgency: courierAgency || null,
          trackingId: trackingId || null
        })
        .eq('id', orderId);

      if (error) throw error;
      showToast('Order delivery details saved!', 'success');
      await fetchData();

      // Update active dialog details
      setSelectedOrder(prev => ({
        ...prev,
        status,
        courierAgency,
        trackingId
      }));

      // Send custom notification
      let title = 'Order Update 📦';
      let message = `Your order #${orderId.slice(0, 8)}... details have been updated.`;
      
      if (status === 'processing') {
        title = 'Order Processing ⚙️';
        message = `Your order #${orderId.slice(0, 8)}... is being prepared for dispatch.`;
      } else if (status === 'shipped') {
        title = 'Order Shipped! 🚚';
        message = `Your order #${orderId.slice(0, 8)}... has been shipped via ${courierAgency || 'Standard Courier'}. Tracking ID: ${trackingId || 'N/A'}.`;
      } else if (status === 'delivered') {
        title = 'Order Delivered! 🎉';
        message = `Your order #${orderId.slice(0, 8)}... has been successfully delivered.`;
      }

      await supabase
        .from('notifications')
        .insert([{
          userId: selectedOrder.userId,
          title,
          message
        }]);

    } catch (err) {
      console.error('Failed to save shipping details:', err);
      showToast('Failed to save order details: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteSticker = async () => {
    if (!deleteConfirmId) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('stickers')
        .delete()
        .eq('id', deleteConfirmId);

      if (error) throw error;
      showToast('Sticker deleted from catalog.', 'success');
      setDeleteConfirmId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete sticker from Supabase:', err);
      showToast('Failed to delete sticker: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSticker = async (e) => {
    e.preventDefault();
    if (!editingSticker) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('stickers')
        .update({
          name: editingSticker.name,
          emoji: editingSticker.emoji,
          category: editingSticker.category,
          price: parseInt(editingSticker.price),
          stock: parseInt(editingSticker.stock),
          description: editingSticker.description,
          imageUrl: editingSticker.imageUrl || null,
          images: editingSticker.images || [],
        })
        .eq('id', editingSticker.id);

      if (error) throw error;
      setEditingSticker(null);
      setEditImageUrlInput('');
      showToast('Sticker changes saved successfully!', 'success');
      await fetchData();
    } catch (err) {
      console.error('Failed to update sticker in Supabase:', err);
      showToast('Failed to update sticker: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.emoji) {
      showToast('Name and Emoji are required!', 'error');
      return;
    }
    try {
      setLoading(true);
      const categoryId = newCategory.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');

      const payload = {
        id: categoryId,
        name: newCategory.name,
        emoji: newCategory.emoji,
        color: newCategory.color || '#6C63FF',
        description: newCategory.description || '',
        imageUrl: newCategory.imageUrl || null
      };

      const { error } = await supabase
        .from('categories')
        .insert([payload]);

      if (error) throw error;

      setNewCategory({ name: '', emoji: '', color: '#6C63FF', description: '', imageUrl: '' });
      showToast('Category added successfully!', 'success');
      await fetchData();
    } catch (err) {
      console.error('Failed to add category to Supabase:', err);
      showToast('Failed to add category: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the category "${id}"? This will not delete the stickers associated with it, but you should re-assign them.`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Category deleted from database.', 'success');
      await fetchData();
    } catch (err) {
      console.error('Failed to delete category from Supabase:', err);
      showToast('Failed to delete category: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name || !editingCategory.emoji) {
      showToast('Name and Emoji are required!', 'error');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          emoji: editingCategory.emoji,
          color: editingCategory.color || '#6C63FF',
          description: editingCategory.description || '',
          imageUrl: editingCategory.imageUrl || null
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      showToast('Category updated successfully!', 'success');
      setEditingCategory(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to update category in Supabase:', err);
      showToast('Failed to update category: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const stats = [
    { label: 'Total Stickers', value: stickers.length, icon: '🏷️', color: '#6C63FF', bg: '#6C63FF15' },
    { label: 'Total Orders', value: orders.length, icon: '📦', color: '#FF6B6B', bg: '#FF6B6B15' },
    { label: 'Revenue', value: `₹${orders.reduce((s, o) => s + (o.total || 0), 0)}`, icon: '💰', color: '#10B981', bg: '#10B98115' },
    { label: 'Pending Orders', value: orders.filter(o => o.status !== 'delivered').length, icon: '⏳', color: '#F59E0B', bg: '#F59E0B15' },
  ];

  // 1. Loading check
  if (!isLoaded) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={45} thickness={4.5} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>Initializing Secure Session...</Typography>
      </Box>
    );
  }

  // 2. Unauthenticated check (Show Clerk SignIn widget)
  if (!isSignedIn) {
    return (
      <Box
        className="fade-in"
        sx={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
          py: 6,
          px: 2,
        }}
      >
        <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper sx={{ p: 4, width: '100%', borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)' }}>
            <Box sx={{ mb: 3 }}>
              <LockIcon sx={{ fontSize: 50, color: '#FF6B6B', filter: 'drop-shadow(0 0 10px rgba(255,107,107,0.3))' }} />
            </Box>
            <Typography variant="h5" fontWeight={900} mb={1} color="white">
              Admin Access Required
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, fontSize: '0.9rem' }}>
              This page contains sensitive shop details. Please log in with authorized credentials.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', '& .cl-rootBox': { mx: 'auto' } }}>
              <SignIn routing="hash" fallbackRedirectUrl="/admin" />
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // 3. Unauthorized access check
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'rahul1772005mani@gmail.com,admin@vrindastudio.com').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = userEmail && adminEmails.includes(userEmail.toLowerCase());

  if (!isAdmin) {
    return (
      <Box
        className="fade-in"
        sx={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
          py: 6,
          px: 2,
        }}
      >
        <Paper
          sx={{
            p: 5,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            borderRadius: 5,
            boxShadow: '0 20px 40px rgba(225,29,72,0.1)',
            border: '1px solid rgba(225,29,72,0.15)',
            bgcolor: 'white'
          }}
        >
          <Box sx={{ fontSize: '4.5rem', mb: 2 }}>🚫</Box>
          <Typography variant="h4" fontWeight={900} color="error.main" mb={2}>
            Access Denied
          </Typography>
          <Typography variant="body1" fontWeight={500} color="text.primary" mb={1}>
            Unauthorized Administrator Account
          </Typography>
          <Typography color="text.secondary" mb={4} sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            Your signed-in email address (<strong>{userEmail}</strong>) is not authorized to access this dashboard.
            If this is an error, please contact your store owner or update your <code>.env</code> configurations.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={() => window.location.reload()}
              sx={{ px: 4, borderRadius: 50 }}
            >
              Retry
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => signOut()}
              sx={{ px: 4, borderRadius: 50, borderColor: 'grey.300', '&:hover': { bgcolor: 'grey.50' } }}
            >
              Sign Out
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Filter lists for real-time queries
  const filteredStickers = stickers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(stickerSearch.toLowerCase()) ||
      s.description?.toLowerCase().includes(stickerSearch.toLowerCase()) ||
      s.tags?.some(t => t.toLowerCase().includes(stickerSearch.toLowerCase()));
    const matchesCategory = stickerCategory === 'all' || s.category.toLowerCase() === stickerCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const lowStockStickers = stickers.filter(s => s.stock < 20);

  // 4. Authorized user: Render the dashboard content!
  return (
    <Box sx={{ minHeight: '85vh', bgcolor: '#F8F9FC', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* LEFT COLUMN: Sidebar Navigation */}
      <Box sx={{
        width: { xs: '100%', md: 240, lg: 280 },
        flexShrink: 0,
        borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: '#1A1A2E',
          color: 'white',
          p: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sidebar Logo Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '2rem' }}>🏷️</Typography>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ background: 'linear-gradient(135deg, #9D97FF, #FF8FAB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                Vrinda Studio
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600 }}>
                ADMIN CONTROL CENTER
              </Typography>
            </Box>
          </Box>

          {/* Navigation Items */}
          <List sx={{ p: 2, flexGrow: 1 }}>
            {[
              { label: 'Overview', icon: <DashboardIcon />, value: 0 },
              { label: 'Add Sticker', icon: <AddIcon />, value: 1 },
              { label: 'Manage Stock', icon: <InventoryIcon />, value: 2 },
              { label: 'Manage Orders', icon: <ShoppingBagIcon />, value: 3 },
              { label: 'Payment Ledger', icon: <PaymentsIcon />, value: 4 },
              { label: 'Manage Categories', icon: <CategoryIcon />, value: 6 },
              { label: 'System Settings', icon: <SettingsIcon />, value: 5 }
            ].map((item) => (
              <ListItem key={item.value} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={tab === item.value}
                  onClick={() => setTab(item.value)}
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    py: 1.2,
                    color: tab === item.value ? 'white' : 'rgba(255,255,255,0.7)',
                    bgcolor: tab === item.value ? 'rgba(108,99,255,0.15)' : 'transparent',
                    borderLeft: tab === item.value ? '4px solid #6C63FF' : '4px solid transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.04)',
                      color: 'white'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(108,99,255,0.25)',
                      '&:hover': { bgcolor: 'rgba(108,99,255,0.3)' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: tab === item.value ? '#9D97FF' : 'rgba(255,255,255,0.5)', minWidth: 38 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Sidebar User Profile Footer */}
          <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.06)', bgcolor: '#111122' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar src={clerkUser?.imageUrl} sx={{ width: 38, height: 38, border: '2px solid rgba(157,151,255,0.5)' }} />
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={700} color="white" noWrap>{clerkUser?.firstName || 'Admin'}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }} noWrap>{userEmail}</Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={() => signOut()}
              sx={{
                color: '#FF6B6B',
                borderColor: 'rgba(255,107,107,0.3)',
                '&:hover': {
                  borderColor: '#FF6B6B',
                  bgcolor: 'rgba(255,107,107,0.05)'
                },
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                py: 0.8
              }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>

        {/* RIGHT COLUMN: Fluid Canvas Content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 4, overflowX: 'hidden' }}>

          {/* SaaS Canvas Header Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#1A1A2E' }}>
                {tab === 0 && 'Overview Dashboard'}
                {tab === 1 && 'Sticker Publisher'}
                {tab === 2 && 'Sticker Inventory'}
                {tab === 3 && 'Order Fulfilment Ledger'}
                {tab === 4 && 'Financial Ledger'}
                {tab === 5 && 'System Controls'}
                {tab === 6 && 'Category Manager'}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {tab === 0 && 'Live monitoring of stickers, inventory health, and recent collections.'}
                {tab === 1 && 'Design and publish new stickers directly to the active storefront.'}
                {tab === 2 && 'Manage stock counts, prices, descriptions, and visual graphics.'}
                {tab === 3 && 'Inspect shipping parameters, update tracking milestones, and search customer IDs.'}
                {tab === 4 && 'Review transaction logs, paid operations, and pending receivables.'}
                {tab === 5 && 'Run diagnostic migrations and import mock catalogs.'}
                {tab === 6 && 'Create, view, and remove category folders dynamically.'}
              </Typography>
            </Box>

            {/* Connection Status Health Indicators */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: 'white', px: 2, py: 1, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary">Clerk</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dbMissing ? '#EF4444' : '#10B981' }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary">Supabase</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <IconButton size="small" onClick={fetchData} disabled={loading} sx={{ color: 'primary.main' }}>
                <CircularProgress size={16} color="inherit" sx={{ display: loading ? 'block' : 'none' }} />
                {!loading && <DatabaseIcon fontSize="small" />}
              </IconButton>
            </Stack>
          </Box>

          {/* Missing Database Tables Warning Banner */}
          {dbMissing && (
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: '#FFF5F5',
                border: '1px solid #FEB2B2',
                boxShadow: '0 4px 12px rgba(229, 62, 62, 0.05)',
                mb: 2,
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ fontSize: '2rem', lineHeight: 1 }}>⚠️</Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#C53030" mb={0.5}>
                    Database Tables Missing!
                  </Typography>
                  <Typography variant="body2" color="#742A2A" mb={2} sx={{ lineHeight: 1.6 }}>
                    The backend connection to Supabase is active, but the required tables (e.g. <code>stickers</code>, <code>orders</code>) do not exist in your database schema yet.
                  </Typography>

                  <Typography variant="body2" fontWeight={700} color="#742A2A" mb={1}>
                    How to solve this:
                  </Typography>
                  <Box component="ol" sx={{ m: 0, pl: 2.5, color: '#742A2A', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <li>Open your <strong>[schema.sql](file:///c:/Users/rahul/Desktop/Sticker/schema.sql)</strong> file and copy the contents.</li>
                    <li>Go to your <strong>Supabase Project Console</strong>.</li>
                    <li>Click <strong>SQL Editor</strong> in the left sidebar ➔ Click <strong>New Query</strong>.</li>
                    <li>Paste the SQL script and click the <strong>Run</strong> button at the bottom right.</li>
                    <li>Click the refresh indicator next to the connection status top bar to reconnect.</li>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* tab contents */}
          <Box>

            {/* ===== TAB 0: OVERVIEW ===== */}
            {tab === 0 && (
              <Box className="fade-in">
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {stats.map((stat) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.label}>
                      <Card sx={{
                        p: 1,
                        borderLeft: `5px solid ${stat.color}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 30px ${stat.color}15`,
                        }
                      }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '16px !important' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                              {stat.label}
                            </Typography>
                            <Typography variant="h4" fontWeight={900} sx={{ color: '#1A1A2E' }}>
                              {stat.value}
                            </Typography>
                          </Box>
                          <Box sx={{
                            width: 48, height: 48, borderRadius: 3,
                            bgcolor: stat.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1.5rem',
                          }}>
                            {stat.icon}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={4}>
                  {/* Left block: Low stock alerts */}
                  <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', minHeight: '350px' }}>
                      <Typography variant="subtitle1" fontWeight={800} mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF6B6B' }}>
                        ⚠️ Low Stock Warnings ({lowStockStickers.length})
                      </Typography>
                      {lowStockStickers.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', textAlign: 'center' }}>
                          <CheckCircleIcon sx={{ fontSize: 44, color: '#10B981', mb: 1.5 }} />
                          <Typography variant="body2" fontWeight={700}>Inventory healthy!</Typography>
                          <Typography variant="caption" color="text.secondary">All stickers have stock quantities above 20.</Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                          {lowStockStickers.map(s => (
                            <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'space-between', p: 1.5, bgcolor: '#FFF1F2', borderRadius: 3, border: '1px solid rgba(255,107,107,0.15)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={s.imageUrl || ''} sx={{ width: 34, height: 34, bgcolor: 'white', '& img': { objectFit: 'contain', p: 0.2 } }}>
                                  {!s.imageUrl && s.emoji}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>{s.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{s.category}</Typography>
                                </Box>
                              </Box>
                              <Chip label={`${s.stock} items left`} color="error" size="small" sx={{ fontWeight: 850 }} />
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>

                  {/* Right block: Recent orders summary */}
                  <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', minHeight: '350px' }}>
                      <Typography variant="subtitle1" fontWeight={800} mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        ⏱️ Recent Order Transactions
                      </Typography>
                      {orders.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', textAlign: 'center' }}>
                          <ShoppingBagIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1.5 }} />
                          <Typography variant="body2" fontWeight={700}>No orders recorded yet</Typography>
                          <Typography variant="caption" color="text.secondary">Once customers place orders, they will appear here.</Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.8}>
                          {orders.slice(0, 4).map(order => (
                            <Box key={order.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{order.customerName}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">{order.customerEmail} • {order.date}</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={800} color="primary.main">₹{order.total}</Typography>
                                  <Chip label={order.status} size="small" color={statusColors[order.status]} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }} />
                                </Box>
                                <IconButton size="small" color="primary" onClick={() => setSelectedOrder(order)} sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ===== TAB 1: ADD STICKER ===== */}
            {tab === 1 && (
              <Box className="fade-in">
                <Grid container spacing={4}>
                  {/* Left Column: Form */}
                  <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                      <Box component="form" onSubmit={handleAddSticker} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* Row 1: Sticker Name & Emoji Fallback */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            fullWidth required label="Sticker Name"
                            placeholder="e.g. Happy Sun"
                            value={newSticker.name}
                            onChange={(e) => setNewSticker(p => ({ ...p, name: e.target.value }))}
                            sx={{ flexGrow: 2 }}
                          />
                          <TextField
                            fullWidth required label="Emoji Fallback"
                            placeholder="e.g. ☀️"
                            value={newSticker.emoji}
                            onChange={(e) => setNewSticker(p => ({ ...p, emoji: e.target.value }))}
                            sx={{ flexGrow: 1, maxWidth: { sm: 180 } }}
                          />
                        </Stack>

                        {/* Row 2: Category */}
                        <FormControl fullWidth required>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={newSticker.category} label="Category"
                            onChange={(e) => setNewSticker(p => ({ ...p, category: e.target.value }))}
                          >
                            {categoriesState.map(c => (
                              <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Row 3: Product Image Settings */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderStyle: 'dashed', borderColor: 'primary.light' }}>
                          <Typography variant="subtitle2" fontWeight={750} mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            🖼️ Product Image Source
                          </Typography>
                          <ToggleButtonGroup
                            value={imageInputMode}
                            exclusive
                            onChange={(_, val) => val && setImageInputMode(val)}
                            size="small"
                            sx={{ mb: 2 }}
                          >
                            <ToggleButton value="url" sx={{ textTransform: 'none', gap: 0.5 }}>
                              <LinkIcon fontSize="small" /> Paste URL
                            </ToggleButton>
                            <ToggleButton value="file" sx={{ textTransform: 'none', gap: 0.5 }}>
                              <CloudUploadIcon fontSize="small" /> Upload File
                            </ToggleButton>
                          </ToggleButtonGroup>

                          {imageInputMode === 'url' ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                fullWidth
                                label="Paste Image URL"
                                placeholder="Paste image link here..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                              />
                              <Button
                                variant="contained"
                                onClick={() => {
                                  if (imageUrlInput.trim()) {
                                    setNewSticker(p => {
                                      const images = [...(p.images || []), imageUrlInput.trim()];
                                      return {
                                        ...p,
                                        images,
                                        imageUrl: p.imageUrl || imageUrlInput.trim()
                                      };
                                    });
                                    setImageUrlInput('');
                                    showToast('Image URL added to gallery!', 'success');
                                  }
                                }}
                                sx={{ fontWeight: 700, textTransform: 'none' }}
                              >
                                Add
                              </Button>
                            </Box>
                          ) : (
                            <Box>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                disabled={uploading}
                                fullWidth
                                sx={{ py: 1.5, borderStyle: 'dashed', textTransform: 'none', fontWeight: 700 }}
                              >
                                {uploading ? 'Uploading to Supabase...' : 'Choose Image File'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(e) => handleFileUpload(e, false)}
                                />
                              </Button>
                              {uploadError && (
                                <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
                                  {uploadError}
                                </Alert>
                              )}
                            </Box>
                          )}

                          {/* Add Sticker images list */}
                          {newSticker.images && newSticker.images.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                              {newSticker.images.map((url, idx) => (
                                <Box key={idx} sx={{ position: 'relative', width: 64, height: 64, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.50' }}>
                                  <Box component="img" src={url} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }} />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const updatedImages = newSticker.images.filter((_, i) => i !== idx);
                                      setNewSticker(p => ({
                                        ...p,
                                        images: updatedImages,
                                        imageUrl: updatedImages[0] || ''
                                      }));
                                    }}
                                    sx={{ position: 'absolute', top: -4, right: -4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' }, p: 0.2 }}
                                  >
                                    <CloseIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Paper>

                        {/* Row 4: Price & Stock */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            fullWidth required label="Price (₹)" type="number"
                            placeholder="e.g. 49"
                            value={newSticker.price}
                            onChange={(e) => setNewSticker(p => ({ ...p, price: e.target.value }))}
                            inputProps={{ min: 1 }}
                          />
                          <TextField
                            fullWidth required label="Stock" type="number"
                            placeholder="e.g. 100"
                            value={newSticker.stock}
                            onChange={(e) => setNewSticker(p => ({ ...p, stock: e.target.value }))}
                            inputProps={{ min: 0 }}
                          />
                        </Stack>

                        {/* Row 5: Description */}
                        <TextField
                          fullWidth multiline rows={2.5}
                          label="Description"
                          placeholder="Describe this sticker..."
                          value={newSticker.description}
                          onChange={(e) => setNewSticker(p => ({ ...p, description: e.target.value }))}
                        />

                        {/* Row 6: Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <Button
                            type="submit" variant="contained" size="large"
                            startIcon={<AddIcon />}
                            disabled={!newSticker.name || !newSticker.emoji || !newSticker.price || uploading}
                            sx={{ px: 4, py: 1.2 }}
                          >
                            Add Sticker
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Right Column: Live Preview */}
                  <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', position: 'sticky', top: 20 }}>
                      <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.secondary" align="center">
                        👀 Real-time Storefront Preview
                      </Typography>
                      <Box sx={{ maxWidth: 280, mx: 'auto', p: 1, bgcolor: '#fff', borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
                        <StickerCard
                          sticker={{
                            id: 999,
                            name: newSticker.name || 'Your Sticker Name',
                            emoji: newSticker.emoji || '✨',
                            category: newSticker.category || 'Funny',
                            price: parseInt(newSticker.price) || 49,
                            originalPrice: newSticker.price ? Math.round(parseInt(newSticker.price) * 1.3) : 69,
                            bgColor: '#F3F4F6',
                            rating: 5.0,
                            reviews: 0,
                            stock: parseInt(newSticker.stock) || 100,
                            imageUrl: newSticker.imageUrl || null,
                            isNew: true,
                            isTrending: false,
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ===== TAB 2: MANAGE STOCK ===== */}
            {tab === 2 && (
              <Box className="fade-in">
                {/* Advanced Search/Filter Bar */}
                <Paper sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by name, description, tags..."
                        value={stickerSearch}
                        onChange={(e) => setStickerSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={stickerCategory}
                          label="Category"
                          onChange={(e) => setStickerCategory(e.target.value)}
                        >
                          <MenuItem value="all">All Categories</MenuItem>
                          {categoriesState.map(c => (
                            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                      <ToggleButtonGroup
                        value={inventoryViewMode}
                        exclusive
                        size="small"
                        onChange={(_, val) => val && setInventoryViewMode(val)}
                      >
                        <ToggleButton value="table" sx={{ gap: 0.5 }}>
                          <ViewListIcon fontSize="small" /> Table
                        </ToggleButton>
                        <ToggleButton value="grid" sx={{ gap: 0.5 }}>
                          <GridViewIcon fontSize="small" /> Grid View
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Content Render: Grid View vs. Table View */}
                {filteredStickers.length === 0 ? (
                  <Paper sx={{ p: 6, borderRadius: 4, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
                    <Typography variant="h6" fontWeight={850}>No stickers match your filters</Typography>
                    <Typography variant="body2" color="text.secondary">Try resetting your search query or choosing another category.</Typography>
                  </Paper>
                ) : inventoryViewMode === 'table' ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'rgba(108,99,255,0.04)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Sticker Details</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Price</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Stock Level</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Store Badges</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStickers.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={s.imageUrl || ''}
                                  sx={{
                                    bgcolor: s.bgColor || '#F3F4F6',
                                    fontSize: '1.2rem',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    '& img': { objectFit: 'contain', p: 0.5 }
                                  }}
                                >
                                  {!s.imageUrl && s.emoji}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={800}>{s.name}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {s.description || 'No description'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={s.category} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={900} color="primary.main">₹{s.price}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${s.stock} items`}
                                size="small"
                                color={s.stock < 20 ? 'error' : 'success'}
                                variant={s.stock < 20 ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 750 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                {s.isTrending && <Chip label="Hot" color="error" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                                {s.isNew && <Chip label="New" color="success" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                                {!s.isTrending && !s.isNew && <Chip label="Normal" variant="outlined" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />}
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                <Tooltip title="Edit Product">
                                  <IconButton size="small" color="primary" onClick={() => setEditingSticker({ ...s, images: s.images || (s.imageUrl ? [s.imageUrl] : []) })} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Product">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(s.id)} sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  // Grid View layout
                  <Grid container spacing={3}>
                    {filteredStickers.map((s) => (
                      <Grid item xs={12} sm={6} md={4} key={s.id} sx={{ position: 'relative' }}>
                        {/* Action buttons overlay for grid cards */}
                        <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 2, display: 'flex', gap: 0.8 }}>
                          <IconButton size="small" onClick={() => setEditingSticker({ ...s, images: s.images || (s.imageUrl ? [s.imageUrl] : []) })} sx={{ bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', color: 'primary.main', '&:hover': { bgcolor: '#f4f4f4' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteConfirm(s.id)} sx={{ bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', color: 'error.main', '&:hover': { bgcolor: '#f4f4f4' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ p: 0.5, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                          <StickerCard sticker={s} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* ===== TAB 3: ORDERS ===== */}
            {tab === 3 && (
              <Box className="fade-in">
                {/* Advanced Search & Filtering for Orders */}
                <Paper sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={7}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by customer name, email address, or Order ID..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Delivery Status</InputLabel>
                        <Select
                          value={orderStatusFilter}
                          label="Delivery Status"
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Orders</MenuItem>
                          <MenuItem value="placed">Placed ⏳</MenuItem>
                          <MenuItem value="processing">Processing ⚙️</MenuItem>
                          <MenuItem value="shipped">Shipped 📦</MenuItem>
                          <MenuItem value="delivered">Delivered ✅</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>

                {filteredOrders.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '4rem', mb: 2 }}>📦</Typography>
                    <Typography variant="h6" fontWeight={850}>No orders found</Typography>
                    <Typography variant="body2" color="text.secondary">Try adjusting your search filters.</Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'rgba(108,99,255,0.04)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Customer Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Purchased Items</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Total Paid</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Order Date</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={800} color="primary.main">
                                #{order.id.substring(0, 8)}...
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={750}>{order.customerName}</Typography>
                              <Typography variant="caption" color="text.secondary" display="block">{order.customerEmail}</Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                {order.items.map((item, idx) => (
                                  <Tooltip title={`${item.name} (Qty: ${item.quantity || 1})`} key={idx}>
                                    <Avatar
                                      src={item.imageUrl || ''}
                                      sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#F3F4F6', border: '1px solid rgba(0,0,0,0.06)', '& img': { objectFit: 'contain', p: 0.2 } }}
                                    >
                                      {!item.imageUrl && item.emoji}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                                <Typography variant="caption" sx={{ ml: 1, fontWeight: 700 }}>
                                  ({order.items.reduce((s, i) => s + (i.quantity || 1), 0)} items)
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={900}>₹{order.total}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{order.date}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                color={statusColors[order.status]}
                                size="small"
                                sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                <Tooltip title="Inspect Shipment details">
                                  <IconButton size="small" color="primary" onClick={() => setSelectedOrder(order)} sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <Select
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    sx={{ borderRadius: 2, height: 30, fontSize: '0.75rem', fontWeight: 700 }}
                                  >
                                    {['placed', 'processing', 'shipped', 'delivered'].map(s => (
                                      <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* ===== TAB 4: PAYMENTS ===== */}
            {tab === 4 && (
              <Box className="fade-in">
                {/* Summary Metrics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {[
                    { label: 'Total Revenue', value: `₹${orders.reduce((s, o) => s + o.total, 0)}`, color: '#10B981', bg: '#10B98115', desc: 'Settled amount' },
                    { label: 'Delivered Orders', value: orders.filter(o => o.status === 'delivered').length, color: '#6C63FF', bg: '#6C63FF15', desc: 'Paid shipments' },
                    { label: 'Pending Collections', value: `₹${orders.filter(o => o.status !== 'delivered').reduce((s, o) => s + o.total, 0)}`, color: '#F59E0B', bg: '#F59E0B15', desc: 'Awaiting delivery' },
                  ].map(s => (
                    <Grid item xs={12} sm={4} key={s.label}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: `4px solid ${s.color}` }}>
                        <Typography variant="h4" fontWeight={900} sx={{ color: s.color, mb: 0.5 }}>
                          {s.value}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={750} color="text.primary" sx={{ fontSize: '0.85rem' }}>{s.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'rgba(108,99,255,0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Customer Name</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Purchase Date</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Amount Paid</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Payment Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography fontWeight={850} color="primary.main">#{order.id.substring(0, 8)}...</Typography>
                          </TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Typography fontWeight={900}>₹{order.total}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status === 'delivered' ? 'Settled ✅' : 'Escrow / Pending ⏳'}
                              color={order.status === 'delivered' ? 'success' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* ===== TAB 5: SYSTEM SETTINGS ===== */}
            {tab === 5 && (
              <Box className="fade-in">
                <Paper sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight={800} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DatabaseIcon color="primary" /> Seed stickers Database
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    If your database has no stickers loaded yet, click the button below to upload the initial 20 stickers across categories (Funny, Cute, Anime, Nature, Food, Sports, Karnataka special).
                  </Typography>

                  {seedingMessage && (
                    <Alert severity={seedingMessage.includes('❌') ? 'error' : seedingMessage.includes('✅') ? 'success' : 'info'} sx={{ mb: 3, borderRadius: 3 }}>
                      {seedingMessage}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={seedingLoading ? <CircularProgress size={20} color="inherit" /> : <DatabaseIcon />}
                    onClick={handleSeedDatabase}
                    disabled={seedingLoading}
                    sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                  >
                    {seedingLoading ? 'Seeding Database...' : 'Seed Initial Stickers'}
                  </Button>
                </Paper>

                <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,107,107,0.15)', bgcolor: 'rgba(255,107,107,0.02)' }}>
                  <Typography variant="subtitle1" fontWeight={800} color="error.main" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertCircleIcon /> Danger Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Warning: resetting configurations will reset data mappings. These actions are irreversible.
                  </Typography>
                  <Button variant="outlined" color="error" disabled sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Reset System Data
                  </Button>
                </Paper>
              </Box>
            )}

            {/* ===== TAB 6: MANAGE CATEGORIES ===== */}
            {tab === 6 && (
              <Box className="fade-in">
                <Grid container spacing={4}>
                  {/* Left Column: Form to Add New Category */}
                  <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={800} mb={3}>
                        ➕ Add New Category
                      </Typography>
                      <Box component="form" onSubmit={handleAddCategory} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                          fullWidth required label="Category Name"
                          placeholder="e.g. Vintage"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(p => ({ ...p, name: e.target.value }))}
                        />
                        <TextField
                          fullWidth required label="Emoji Fallback"
                          placeholder="e.g. 📻"
                          value={newCategory.emoji}
                          onChange={(e) => setNewCategory(p => ({ ...p, emoji: e.target.value }))}
                        />
                        <TextField
                          fullWidth label="Theme Hex Color"
                          placeholder="e.g. #FFB703"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(p => ({ ...p, color: e.target.value }))}
                          helperText="Hex code starting with #"
                        />
                        <TextField
                          fullWidth multiline rows={3}
                          label="Description"
                          placeholder="e.g. Retro and classic style stickers"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory(p => ({ ...p, description: e.target.value }))}
                        />
                        {/* Category PNG Image Upload */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                            CATEGORY LOGO / PNG IMAGE (OPTIONAL)
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={categoryUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                              disabled={categoryUploading}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              {categoryUploading ? 'Uploading...' : 'Upload PNG'}
                              <input
                                type="file"
                                hidden
                                accept="image/png"
                                onChange={handleCategoryFileUpload}
                              />
                            </Button>
                            {newCategory.imageUrl && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                  src={newCategory.imageUrl} 
                                  variant="rounded" 
                                  sx={{ width: 36, height: 36, bgcolor: 'grey.100', '& img': { objectFit: 'contain', p: 0.2 } }} 
                                />
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => setNewCategory(p => ({ ...p, imageUrl: '' }))}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Stack>
                          {categoryUploadError && (
                            <Typography variant="caption" color="error" display="block" mt={1}>
                              {categoryUploadError}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          type="submit" variant="contained" size="large"
                          disabled={!newCategory.name || !newCategory.emoji}
                          sx={{ py: 1.2, fontWeight: 700 }}
                        >
                          Create Category
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Right Column: List of Categories */}
                  <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={800} mb={3}>
                        📁 Existing Store Categories ({categoriesState.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {categoriesState.map((cat) => (
                          <Grid item xs={12} sm={6} key={cat.id}>
                            <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: `5px solid ${cat.color || '#6C63FF'}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                                  <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                                    {cat.imageUrl ? (
                                      <Box component="img" src={cat.imageUrl} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }} />
                                    ) : (
                                      cat.emoji
                                    )}
                                  </Box>
                                  <Box>
                                    <Typography variant="body1" fontWeight={800}>{cat.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                                      Slug: {cat.id}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                  {cat.description || 'No description available for this category.'}
                                </Typography>
                              </CardContent>
                              <Box sx={{ p: 1.5, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                <Button
                                  size="small" color="primary" startIcon={<EditIcon />}
                                  onClick={() => setEditingCategory(cat)}
                                  sx={{ fontWeight: 700 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small" color="error" startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  sx={{ fontWeight: 700 }}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Box>

      {/* ===== EDIT PRODUCT DIALOG ===== */}
      <Dialog
        open={Boolean(editingSticker)}
        onClose={() => setEditingSticker(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle fontWeight={900}>✏️ Edit Sticker Details</DialogTitle>
        {editingSticker && (
          <Box component="form" onSubmit={handleUpdateSticker}>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Form fields */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth required label="Sticker Name"
                        value={editingSticker.name}
                        onChange={(e) => setEditingSticker(p => ({ ...p, name: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth required label="Emoji Fallback"
                        value={editingSticker.emoji}
                        onChange={(e) => setEditingSticker(p => ({ ...p, emoji: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={editingSticker.category} label="Category"
                          onChange={(e) => setEditingSticker(p => ({ ...p, category: e.target.value }))}
                        >
                          {categoriesState.map(c => (
                            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Image Settings */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderStyle: 'dashed', borderColor: 'primary.light' }}>
                        <Typography variant="subtitle2" fontWeight={750} mb={1}>Sticker Image Source</Typography>
                        <ToggleButtonGroup
                          value={editImageInputMode}
                          exclusive
                          onChange={(_, val) => val && setEditImageInputMode(val)}
                          size="small"
                          sx={{ mb: 1.5 }}
                        >
                          <ToggleButton value="url" sx={{ textTransform: 'none', gap: 0.5 }}>
                            <LinkIcon fontSize="small" /> Paste URL
                          </ToggleButton>
                          <ToggleButton value="file" sx={{ textTransform: 'none', gap: 0.5 }}>
                            <CloudUploadIcon fontSize="small" /> Upload File
                          </ToggleButton>
                        </ToggleButtonGroup>

                        {editImageInputMode === 'url' ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              fullWidth
                              label="Paste Image URL"
                              placeholder="Paste image link here..."
                              value={editImageUrlInput}
                              onChange={(e) => setEditImageUrlInput(e.target.value)}
                            />
                            <Button
                              variant="contained"
                              onClick={() => {
                                  if (editImageUrlInput.trim()) {
                                    setEditingSticker(p => {
                                      const images = [...(p.images || []), editImageUrlInput.trim()];
                                      return {
                                        ...p,
                                        images,
                                        imageUrl: p.imageUrl || editImageUrlInput.trim()
                                      };
                                    });
                                    setEditImageUrlInput('');
                                    showToast('Image URL added to gallery!', 'success');
                                  }
                              }}
                              sx={{ fontWeight: 700, textTransform: 'none' }}
                            >
                              Add
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                              disabled={uploading}
                              fullWidth
                              sx={{ py: 1, borderStyle: 'dashed', textTransform: 'none', fontWeight: 700 }}
                            >
                              {uploading ? 'Uploading to Supabase...' : 'Choose Image File'}
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handleFileUpload(e, true)}
                              />
                            </Button>
                            {uploadError && (
                              <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                                {uploadError}
                              </Alert>
                            )}
                          </Box>
                        )}

                        {/* Edit Sticker images list */}
                        {editingSticker.images && editingSticker.images.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                            {editingSticker.images.map((url, idx) => (
                              <Box key={idx} sx={{ position: 'relative', width: 64, height: 64, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.50' }}>
                                <Box component="img" src={url} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }} />
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const updatedImages = editingSticker.images.filter((_, i) => i !== idx);
                                    setEditingSticker(p => ({
                                      ...p,
                                      images: updatedImages,
                                      imageUrl: updatedImages[0] || ''
                                    }));
                                  }}
                                  sx={{ position: 'absolute', top: -4, right: -4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' }, p: 0.2 }}
                                >
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth required label="Price (₹)" type="number"
                        value={editingSticker.price}
                        onChange={(e) => setEditingSticker(p => ({ ...p, price: e.target.value }))}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth required label="Stock" type="number"
                        value={editingSticker.stock}
                        onChange={(e) => setEditingSticker(p => ({ ...p, stock: e.target.value }))}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth multiline rows={3} label="Description"
                        value={editingSticker.description || ''}
                        onChange={(e) => setEditingSticker(p => ({ ...p, description: e.target.value }))}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Preview column */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={800} mb={1.5} color="text.secondary">
                    Live Card Preview
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: 240, p: 0.5, bgcolor: '#fff', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                    <StickerCard
                      sticker={{
                        id: editingSticker.id,
                        name: editingSticker.name || 'Edited Sticker',
                        emoji: editingSticker.emoji || '✨',
                        category: editingSticker.category || 'Funny',
                        price: parseInt(editingSticker.price) || 0,
                        originalPrice: editingSticker.price ? Math.round(parseInt(editingSticker.price) * 1.3) : null,
                        bgColor: editingSticker.bgColor || '#F3F4F6',
                        rating: editingSticker.rating || 5.0,
                        reviews: editingSticker.reviews || 0,
                        stock: parseInt(editingSticker.stock) || 0,
                        imageUrl: editingSticker.imageUrl || null,
                        isNew: editingSticker.isNew || false,
                        isTrending: editingSticker.isTrending || false,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setEditingSticker(null)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={uploading}>
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* ===== DETAILED ORDER INSPECTION DIALOG ===== */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900 }}>
          <span>Order Details Inspection</span>
          <IconButton size="small" onClick={() => setSelectedOrder(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        {selectedOrder && (
          <DialogContent dividers sx={{ p: { xs: 2, sm: 4 } }}>
            <Grid container spacing={4}>
              {/* Left Column: Shipment coordinates */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={850} mb={1.5}>
                  CUSTOMER & DELIVERY COORDINATES
                </Typography>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#FAFAFA', borderLeft: '4px solid #6C63FF', mb: 3 }}>
                  <Typography variant="body1" fontWeight={800} mb={0.5}>{selectedOrder.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>{selectedOrder.customerEmail}</Typography>
                  <Typography variant="body2" color="text.primary" mb={2}>
                    <strong>Phone:</strong> {selectedOrder.phone || 'N/A'}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 0.5 }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5, color: '#333' }}>
                    {selectedOrder.address.street}<br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                  </Typography>
                </Paper>

                <Typography variant="subtitle2" color="text.secondary" fontWeight={850} mb={1.5}>
                  PAYMENT SUMMARY
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#FAFAFA' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{selectedOrder.subtotal}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Delivery Charge</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={800}>Total Settled</Typography>
                    <Typography variant="body1" fontWeight={900} color="primary.main">₹{selectedOrder.total}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Method</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                      {selectedOrder.paymentMethod || 'Online Payment'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Column: Ordered items list */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={850} mb={1.5}>
                  ITEMS ORDERED ({selectedOrder.items.reduce((s, i) => s + (i.quantity || 1), 0)})
                </Typography>
                <Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto', mb: 3 }}>
                  {selectedOrder.items.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={item.imageUrl || ''} sx={{ width: 38, height: 38, bgcolor: '#F3F4F6', '& img': { objectFit: 'contain', p: 0.2 } }}>
                          {!item.imageUrl && item.emoji}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={750}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Qty: {item.quantity || 1} • Price: ₹{item.price}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight={800}>₹{item.price * (item.quantity || 1)}</Typography>
                    </Box>
                  ))}
                </Stack>

                <Typography variant="subtitle2" color="text.secondary" fontWeight={850} mb={1.5}>
                  SHIPPING & LOGISTICS UPDATES
                </Typography>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FAFAFA' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="inspect-status-label">Order Status</InputLabel>
                        <Select
                          labelId="inspect-status-label"
                          id="inspect-status"
                          value={inspectStatus}
                          label="Order Status"
                          onChange={(e) => setInspectStatus(e.target.value)}
                        >
                          {['placed', 'processing', 'shipped', 'delivered'].map(s => (
                            <MenuItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Chip
                        label={(inspectStatus || '').toUpperCase()}
                        color={statusColors[inspectStatus] || 'default'}
                        sx={{ fontWeight: 900, px: 1, minWidth: 100 }}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      size="small"
                      label="Courier / Logistics Agency"
                      placeholder="e.g. Delhivery, Blue Dart, DTDC, India Post"
                      value={inspectCourier}
                      onChange={(e) => setInspectCourier(e.target.value)}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="Tracking ID / Reference"
                      placeholder="Enter courier tracking number"
                      value={inspectTracking}
                      onChange={(e) => setInspectTracking(e.target.value)}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveShippingDetails(selectedOrder.id, inspectStatus, inspectCourier, inspectTracking)}
                      sx={{ fontWeight: 700, mt: 1, textTransform: 'none' }}
                    >
                      Save & Notify Customer 📦
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handlePrintInvoice}
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            sx={{ fontWeight: 700 }}
          >
            Print Invoice
          </Button>
          <Button onClick={() => setSelectedOrder(null)} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            Close Inspector
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 900, color: 'error.main' }}>
          <AlertCircleIcon sx={{ color: 'error.main' }} /> Delete Sticker
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.primary">
            Are you absolutely sure you want to delete this sticker? This action will immediately remove it from your storefront catalog, and this process is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteSticker} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Yes, Delete Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== EDIT CATEGORY DIALOG ===== */}
      <Dialog
        open={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900 }}>
          <span>Edit Category</span>
          <IconButton size="small" onClick={() => setEditingCategory(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        {editingCategory && (
          <Box component="form" onSubmit={handleUpdateCategory}>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth required label="Category Name"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory(p => ({ ...p, name: e.target.value }))}
              />
              <TextField
                fullWidth required label="Emoji Fallback"
                value={editingCategory.emoji}
                onChange={(e) => setEditingCategory(p => ({ ...p, emoji: e.target.value }))}
              />
              <TextField
                fullWidth label="Theme Hex Color"
                value={editingCategory.color}
                onChange={(e) => setEditingCategory(p => ({ ...p, color: e.target.value }))}
                helperText="Hex code starting with #"
              />
              <TextField
                fullWidth multiline rows={3}
                label="Description"
                value={editingCategory.description}
                onChange={(e) => setEditingCategory(p => ({ ...p, description: e.target.value }))}
              />

              {/* Category PNG Image Upload */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                  CATEGORY LOGO / PNG IMAGE
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={categoryUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={categoryUploading}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {categoryUploading ? 'Uploading...' : 'Upload PNG'}
                    <input
                      type="file"
                      hidden
                      accept="image/png"
                      onChange={(e) => handleCategoryFileUpload(e, true)}
                    />
                  </Button>
                  {editingCategory.imageUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        src={editingCategory.imageUrl} 
                        variant="rounded" 
                        sx={{ width: 36, height: 36, bgcolor: 'grey.100', '& img': { objectFit: 'contain', p: 0.2 } }} 
                      />
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => setEditingCategory(p => ({ ...p, imageUrl: '' }))}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Stack>
                {categoryUploadError && (
                  <Typography variant="caption" color="error" display="block" mt={1}>
                    {categoryUploadError}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setEditingCategory(null)} variant="outlined" sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700 }} disabled={categoryUploading || !editingCategory.name || !editingCategory.emoji}>
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* ===== STATUS SNACKBAR NOTIFICATION ===== */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={handleCloseToast} sx={{ borderRadius: 3, fontWeight: 650 }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* ===== PRINTABLE INVOICE TEMPLATE (Hidden on screen, shown in print) ===== */}
      {selectedOrder && (
        <Box id="printable-invoice" sx={{ display: 'none', p: 4, fontFamily: 'Poppins, sans-serif', color: '#000', bgcolor: '#fff' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', pb: 2, mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 1 }}>VRINDA STUDIO</Typography>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#555' }}>
                Premium Stickers Ooru • Puttūr, Karnataka - 574201
              </Typography>
              <Typography variant="caption" sx={{ color: '#555' }}>Email: support@vrindastudio.com</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" fontWeight={800}>INVOICE</Typography>
              <Typography variant="body2"><strong>Date:</strong> {selectedOrder.date}</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>Order ID:</strong> #{selectedOrder.id}</Typography>
            </Box>
          </Box>

          {/* Billing & Shipping */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ borderBottom: '1px solid #ddd', pb: 0.5, mb: 1, textTransform: 'uppercase', color: '#555' }}>
                Customer Details
              </Typography>
              <Typography variant="body2"><strong>Name:</strong> {selectedOrder.customerName}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {selectedOrder.customerEmail}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ borderBottom: '1px solid #ddd', pb: 0.5, mb: 1, textTransform: 'uppercase', color: '#555' }}>
                Shipping Address
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {selectedOrder.address.street}<br />
                {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
              </Typography>
            </Grid>
          </Grid>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '8px 0', fontWeight: 800 }}>Sticker Item</th>
                <th style={{ padding: '8px 0', fontWeight: 800, textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 0', fontWeight: 800, textAlign: 'right' }}>Price</th>
                <th style={{ padding: '8px 0', fontWeight: 800, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                    <span>{item.name}</span>
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>₹{item.price * (item.quantity || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Box sx={{ width: '250px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" fontWeight={600}>₹{selectedOrder.subtotal}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Delivery Charge:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: '#000' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight={800}>Grand Total:</Typography>
                <Typography variant="body2" fontWeight={900}>₹{selectedOrder.total}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Payment Method:</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  {selectedOrder.paymentMethod || 'Online'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer message */}
          <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px solid #ddd', pt: 2 }}>
            <Typography variant="body2" fontWeight={700}>Thank you for shopping at Vrinda Studio!</Typography>
            <Typography variant="caption" color="text.secondary">This is a system generated invoice. No signature required.</Typography>
          </Box>
        </Box>
      )}

    </Box>
  );
}

export default AdminDashboard;
