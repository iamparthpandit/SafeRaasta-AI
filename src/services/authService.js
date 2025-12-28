// Authentication Service
// This file contains all Firebase authentication logic
// Keeps auth logic separated from UI components

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} - Returns user credential on success
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up successfully:', userCredential.user);
    return {
      success: true,
      user: userCredential.user,
      message: 'Account created successfully!'
    };
  } catch (error) {
    console.error('Sign up error:', error.code, error.message);
    
    // Handle specific error cases
    let errorMessage = 'Failed to create account. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please log in.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Log in an existing user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} - Returns user credential on success
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in successfully:', userCredential.user);
    return {
      success: true,
      user: userCredential.user,
      message: 'Logged in successfully!'
    };
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    
    // Handle specific error cases
    let errorMessage = 'Failed to log in. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @returns {Promise} - Returns success message
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent to:', email);
    return {
      success: true,
      message: 'Password reset link sent to your email!'
    };
  } catch (error) {
    console.error('Password reset error:', error.code, error.message);
    
    // Handle specific error cases
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Log out the current user
 * @returns {Promise} - Returns success message
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('User logged out successfully');
    return {
      success: true,
      message: 'Logged out successfully!'
    };
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to log out. Please try again.');
  }
};

/**
 * Get current authenticated user
 * @returns {Object|null} - Returns current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
