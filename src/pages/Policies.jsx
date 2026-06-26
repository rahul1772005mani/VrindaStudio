// Policies.jsx - Premium page displaying store policies: Privacy, Returns, Refunds, and Disclaimers.
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Tab, Tabs, Paper,
  Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LoopIcon from '@mui/icons-material/Loop';
import PaymentsIcon from '@mui/icons-material/Payments';
import GavelIcon from '@mui/icons-material/Gavel';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

function Policies({ tab }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  // Map incoming policy tab keyword to index
  const tabMapping = {
    privacy: 0,
    returns: 1,
    refund: 2,
    disclaimer: 3
  };

  useEffect(() => {
    if (tab && tabMapping[tab] !== undefined) {
      setActiveTab(tabMapping[tab]);
    }
  }, [tab, location]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="fade-in" sx={{ minHeight: '80vh', bgcolor: '#F8F9FC', py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={900} sx={{ color: '#1A1A2E', mb: 1, background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B6B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Legal & Customer Policies
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Everything you need to know about shopping, security, and returns at Vrinda Studio.
          </Typography>
        </Box>

        <Paper sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 32px rgba(108,99,255,0.04)' }}>
          
          {/* Sidebar Tabs */}
          <Box sx={{ borderRight: { xs: 'none', md: '1px solid' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider', bgcolor: '#1A1A2E', color: 'white', minWidth: { md: 240 } }}>
            <Tabs
              orientation={{ xs: 'horizontal', md: 'vertical' }}
              variant="scrollable"
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  left: { md: 0 },
                  right: { md: 'auto' },
                  width: { md: 4 },
                  bgcolor: '#6C63FF'
                },
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'none',
                  fontWeight: 600,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  py: 2,
                  px: 3,
                  minHeight: 50,
                  width: '100%',
                  '&.Mui-selected': {
                    color: 'white',
                    bgcolor: 'rgba(108,99,255,0.15)'
                  }
                }
              }}
            >
              <Tab label="🛡️ Privacy Policy" icon={<ShieldIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
              <Tab label="🔄 Return Policy" icon={<LoopIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
              <Tab label="💰 Refund Policy" icon={<PaymentsIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
              <Tab label="⚠️ Disclaimer" icon={<GavelIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Content Canvas */}
          <Box sx={{ flexGrow: 1, p: { xs: 3, sm: 5 }, bgcolor: 'white' }}>
            
            {/* ===== PRIVACY POLICY ===== */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary" mb={2}>🛡️ Privacy & Data Protection Policy</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3} fontWeight={600}>LAST UPDATED: JUNE 2026</Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  At Vrinda Studio, we respect your privacy and are committed to protecting the personal data you share with us. This policy details how we collect, store, and process your information when you buy stickers through our shop storefront.
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={750} mb={1}>1. Information We Collect</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  We collect only the essential personal details required to process your checkout and deliver stickers to your address:
                </Typography>
                <List dense sx={{ pl: 2, mb: 3 }}>
                  {[
                    'Customer details: name, email address, and verified phone number.',
                    'Shipping coordinates: street, city, state, and pincode.',
                    'Checkout logs: items in order, transaction details, and payment method choice.',
                    'User accounts: authentication handled securely using Clerk OAuth/email logins.'
                  ].map((text, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}><FiberManualRecordIcon sx={{ fontSize: 8, color: '#6C63FF' }} /></ListItemIcon>
                      <ListItemText primary={text} primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" fontWeight={750} mb={1}>2. How We Use Your Data</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  Your data is solely used to service your order transaction. We use it to:
                </Typography>
                <List dense sx={{ pl: 2, mb: 3 }}>
                  {[
                    'Fulfill delivery shipments and update tracking details.',
                    'Securely authenticate accounts and maintain order histories.',
                    'Process online checkouts securely via Razorpay payment gateway.',
                    'Send system emails (confirmations, receipt records, or status changes).'
                  ].map((text, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}><FiberManualRecordIcon sx={{ fontSize: 8, color: '#6C63FF' }} /></ListItemIcon>
                      <ListItemText primary={text} primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" fontWeight={750} mb={1}>3. Payment Security & Integrity</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  All online payments are integrated securely with the **Razorpay Checkout SDK**. Vrinda Studio **never** stores or captures raw credit card numbers, CVVs, or Net Banking credentials on our database servers. Razorpay processes all online transaction funds in compliance with international PCI-DSS security protocols.
                </Typography>
              </Box>
            )}

            {/* ===== RETURN POLICY ===== */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary" mb={2}>🔄 7-Day Return Policy</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3} fontWeight={600}>LAST UPDATED: JUNE 2026</Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  We take pride in crafting high-quality waterproof vinyl stickers. However, if you are not fully satisfied with your purchase, we are here to assist. We offer a **7-Day Return Window** for eligible stickers.
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={750} mb={1}>1. Eligibility for Returns</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  To be eligible for a return, the sticker packages must satisfy the following conditions:
                </Typography>
                <List dense sx={{ pl: 2, mb: 3 }}>
                  {[
                    'Stickers must be completely unused, unpeeled, and in their original packaging state.',
                    'The return request must be initiated within 7 calendar days of delivery.',
                    'Eligible issues: damaged stickers during transit, severe printing defects, or shipping errors (wrong design received).'
                  ].map((text, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}><FiberManualRecordIcon sx={{ fontSize: 8, color: '#6C63FF' }} /></ListItemIcon>
                      <ListItemText primary={text} primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" fontWeight={750} mb={1}>2. How to Initiate a Return</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  To request a return, send an email to **rahul1772005mani@gmail.com** (or contact us via our official WhatsApp) with:
                </Typography>
                <List dense sx={{ pl: 2, mb: 3 }}>
                  {[
                    'Your unique Order ID (e.g. #d3a4ef...).',
                    'The email address associated with the order.',
                    'A clear photo of the stickers showing the defect or delivery damage.'
                  ].map((text, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}><FiberManualRecordIcon sx={{ fontSize: 8, color: '#6C63FF' }} /></ListItemIcon>
                      <ListItemText primary={text} primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* ===== REFUND POLICY ===== */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary" mb={2}>💰 Refund & Settlement Policy</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3} fontWeight={600}>LAST UPDATED: JUNE 2026</Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  Once we receive and inspect your returned stickers, we will notify you of the approval or rejection of your refund request.
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={750} mb={1}>1. Approved Refunds Processing</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  If approved, your refund will be processed immediately. The money will automatically be credited back to your original payment method (UPI account or Debit/Credit Card via Razorpay transaction reverse) within **5-7 business days** depending on your bank network.
                </Typography>

                <Typography variant="subtitle1" fontWeight={750} mb={1} sx={{ mt: 3 }}>2. Delivery Charges</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  Shipping fees are non-refundable. If you receive a refund, the cost of original delivery charges will be deducted from your total, unless the return was caused by a processing error on our part (e.g., wrong stickers sent).
                </Typography>
              </Box>
            )}

            {/* ===== DISCLAIMER ===== */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h5" fontWeight={800} color="primary" mb={2}>⚠️ Legal Disclaimer</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3} fontWeight={600}>LAST UPDATED: JUNE 2026</Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  By accessing and shopping at Vrinda Studio, you agree to the terms, conditions, and representations outlined in this legal disclaimer.
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={750} mb={1}>1. Visual Mappings & Colors</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  We strive to display our sticker designs, emojis, and preview graphics as accurately as possible. However, because display monitors and screens vary, we cannot guarantee that the physical sticker colors will exactly match what you see on your digital screen.
                </Typography>

                <Typography variant="subtitle1" fontWeight={750} mb={1} sx={{ mt: 3 }}>2. Shipping Estimates Limitation</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  Delivery estimates (3-7 business days) are projections provided by our courier logistics partners. Vrinda Studio is not liable for delayed shipments caused by unforeseen weather conditions, courier handling, or remote area destination routing.
                </Typography>

                <Typography variant="subtitle1" fontWeight={750} mb={1} sx={{ mt: 3 }}>3. Intellectual Property Rights</Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  Vrinda Studio respects intellectual property. All visual characters, logos, or themed stickers displayed in our catalog are fan-art modifications or publicly shared internet memes. If you are an intellectual property owner and believe any of our stickers infringe upon your copyright, please contact us at **rahul1772005mani@gmail.com** to initiate prompt removal.
                </Typography>
              </Box>
            )}

          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Policies;
