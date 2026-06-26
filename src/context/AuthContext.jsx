// AuthContext.jsx - Context provider for Firebase User Authentication
// This tracks if a user is logged in, their profile info, and provides functions to login/logout.

import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';

// Create the context
const AuthContext = createContext();

// Custom hook to use Auth state easily
export function useAuth() {
  return useContext(AuthContext);
}

// Provider Component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign Up a new user
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Log In an existing user
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log Out the current user
  function logout() {
    return signOut(auth);
  }

  // Reset password via email
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
