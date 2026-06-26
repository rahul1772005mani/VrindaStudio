// Navbar.jsx - The top navigation bar shown on every page
// Contains: Logo, navigation links, cart count, user menu

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge,
  Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, useScrollTrigger, Popover,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useCart } from '../context/CartContext';
import { useUser, UserButton } from '@clerk/clerk-react';
import { supabase } from '../supabase';

// Navigation links for the menu
const navLinks = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Categories', path: '/category/all', icon: <CategoryIcon /> },
  { label: 'My Orders', path: '/orders', icon: <LocalMallIcon /> },
  { label: 'Wishlist', path: '/profile', icon: <FavoriteIcon /> },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { isSignedIn, user: clerkUser } = useUser();
  
  // Admin email check
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'rahul1772005mani@gmail.com,admin@vrindastudio.com').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = isSignedIn && userEmail && adminEmails.includes(userEmail.toLowerCase());

  // State for mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if page is scrolled (to change navbar style)
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 50 });

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleOpenNotifications = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!clerkUser) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', clerkUser.id)
        .eq('read', false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  useEffect(() => {
    if (!isSignedIn || !clerkUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('userId', clerkUser.id)
          .order('createdAt', { ascending: false })
          .limit(10);
        if (error) throw error;
        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();

    // Subscribe to new/updated notifications in real-time
    const channel = supabase
      .channel(`user-notifications-${clerkUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${clerkUser.id}`
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, clerkUser]);

  const goTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={scrolled ? 4 : 0}
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: '1px solid',
          borderColor: 'rgba(108, 99, 255, 0.1)',
          color: 'text.primary',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>

          {/* LEFT: Logo */}
          <Box
            onClick={() => goTo('/')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
              transition: 'opacity 0.2s',
            }}
          >
            <Typography sx={{ fontSize: '1.8rem', lineHeight: 1 }}>🏷️</Typography>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  fontSize: '1.3rem',
                }}
              >
                Vrinda Studio
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}>
                Mangalore, Karnataka 🌟
              </Typography>
            </Box>
          </Box>

          {/* CENTER: Navigation Links (desktop only) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                onClick={() => goTo(link.path)}
                sx={{
                  color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === link.path ? 700 : 500,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: location.pathname === link.path ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                    width: '70%',
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover::after': { transform: 'translateX(-50%) scaleX(1)' },
                }}
              >
                {link.label}
              </Button>
            ))}
            {isAdmin && (
              <Button
                onClick={() => goTo('/admin')}
                sx={{
                  color: location.pathname === '/admin' ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === '/admin' ? 700 : 500,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: location.pathname === '/admin' ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                    width: '70%',
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                  },
                  '&:hover::after': { transform: 'translateX(-50%) scaleX(1)' },
                }}
              >
                Admin Panel
              </Button>
            )}
          </Box>

          {/* RIGHT: Cart + User */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notification bell with badge */}
            {isSignedIn && (
              <>
                <IconButton
                  onClick={handleOpenNotifications}
                  sx={{
                    bgcolor: unreadCount > 0 ? 'rgba(108, 99, 255, 0.1)' : 'grey.100',
                    color: unreadCount > 0 ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
                  </Badge>
                </IconButton>

                {/* Notifications Popover */}
                <Popover
                  anchorEl={notificationsAnchor}
                  open={Boolean(notificationsAnchor)}
                  onClose={handleCloseNotifications}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      width: { xs: 280, sm: 360 },
                      maxHeight: 450,
                      borderRadius: 4,
                      mt: 1.5,
                      boxShadow: '0 8px 32px rgba(108,99,255,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                    }
                  }}
                >
                  {/* Header */}
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={850} color="text.primary">
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        onClick={handleMarkAllAsRead}
                        startIcon={<DoneAllIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </Box>

                  {/* List */}
                  <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                    {notifications.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '2rem', mb: 1 }}>🔔</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          No notifications yet.
                        </Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {notifications.map((notif, idx) => (
                          <Box key={notif.id}>
                            {idx > 0 && <Divider />}
                            <ListItem
                              alignItems="flex-start"
                              onClick={() => handleMarkAsRead(notif.id)}
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                bgcolor: notif.read ? 'transparent' : 'rgba(108, 99, 255, 0.04)',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={800} color={notif.read ? 'text.primary' : 'primary.main'}>
                                      {notif.title}
                                    </Typography>
                                    {!notif.read && (
                                      <Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%' }} />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, lineHeight: 1.4 }}>
                                      {notif.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                                      {new Date(notif.createdAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          </Box>
                        ))}
                      </List>
                    )}
                  </Box>
                </Popover>
              </>
            )}

            {/* Cart icon with badge */}
            <IconButton
              onClick={() => goTo('/cart')}
              sx={{
                bgcolor: cartCount > 0 ? 'primary.main' : 'grey.100',
                color: cartCount > 0 ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  color: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* User Authentication Menu */}
            {isSignedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <UserButton afterSignOutUrl="/" />
              </Box>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => goTo('/login')}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  py: 0.6,
                  ml: 1,
                }}
              >
                Login
              </Button>
            )}

            {/* Mobile menu button */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: 280, borderRadius: '0 24px 24px 0' } }}
      >
        {/* Header */}
        <Box sx={{
          p: 3,
          background: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
          color: 'white',
        }}>
          <Typography variant="h5" fontWeight={900}>🏷️ Vrinda Studio</Typography>
          <Typography variant="caption">Mangalore, Karnataka</Typography>
        </Box>

        <List sx={{ pt: 2 }}>
          {navLinks.map((link) => (
            <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => goTo(link.path)}
                selected={location.pathname === link.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  color: location.pathname === link.path ? 'white' : 'text.primary',
                  bgcolor: location.pathname === link.path ? 'primary.light' : 'transparent',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.main' }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
          {isAdmin && (
            <>
              <Divider sx={{ my: 2 }} />
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => goTo('/admin')}
                  selected={location.pathname === '/admin'}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    color: location.pathname === '/admin' ? 'white' : 'text.primary',
                    bgcolor: location.pathname === '/admin' ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: 'primary.main', color: 'white' },
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;
