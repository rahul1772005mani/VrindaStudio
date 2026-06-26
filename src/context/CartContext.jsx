// CartContext.jsx - This is the "shopping cart brain" of our app
// It uses React Context to share cart data across ALL pages
// Without this, pages can't communicate with each other

import { createContext, useContext, useState, useEffect } from 'react';

// Step 1: Create the Context (like creating a shared "room" for data)
const CartContext = createContext();

// Step 2: Create the Provider (the "room" that wraps our whole app)
export function CartProvider({ children }) {
  // cartItems = list of items added to cart
  // We also save to localStorage so cart doesn't reset on page refresh
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('vrindastudio_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist - stickers the user "liked" / saved for later
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('vrindastudio_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Save cart to localStorage every time it changes
  useEffect(() => {
    localStorage.setItem('vrindastudio_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save wishlist to localStorage every time it changes
  useEffect(() => {
    localStorage.setItem('vrindastudio_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // ADD item to cart
  const addToCart = (sticker, quantity = 1) => {
    setCartItems(prev => {
      // Check if item already in cart
      const existing = prev.find(item => item.id === sticker.id);
      if (existing) {
        // If yes, increase quantity
        return prev.map(item =>
          item.id === sticker.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // If no, add new item with quantity
      return [...prev, { ...sticker, quantity }];
    });
  };

  // REMOVE item from cart completely
  const removeFromCart = (stickerId) => {
    setCartItems(prev => prev.filter(item => item.id !== stickerId));
  };

  // UPDATE quantity of an item
  const updateQuantity = (stickerId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(stickerId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === stickerId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // CLEAR entire cart (after order placed)
  const clearCart = () => {
    setCartItems([]);
  };

  // TOGGLE wishlist (add/remove)
  const toggleWishlist = (sticker) => {
    setWishlist(prev => {
      const isInWishlist = prev.find(item => item.id === sticker.id);
      if (isInWishlist) {
        return prev.filter(item => item.id !== sticker.id);
      }
      return [...prev, sticker];
    });
  };

  // Check if item is in wishlist
  const isInWishlist = (stickerId) => {
    return wishlist.some(item => item.id === stickerId);
  };

  // CALCULATE totals
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryCharge = cartSubtotal > 299 ? 0 : 49; // Free delivery above ₹299
  const cartTotal = cartSubtotal + deliveryCharge;

  // Step 3: Share all this data with the app
  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      deliveryCharge,
      cartTotal,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Step 4: Custom hook - makes it easy to use cart in any component
// Usage: const { cartItems, addToCart } = useCart();
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};
