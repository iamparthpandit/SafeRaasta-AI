// Authentication Service
// This file contains all Firebase authentication logic
// Keeps auth logic separated from UI components

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth } from '../firebase/firebaseConfig';

// Configure Google Sign-In once at module load
GoogleSignin.configure({
  webClientId: '1061233246818-uh66m163s48da04bjpp1llemi256fd0i.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  accountName: '', // Empty string to always show account picker
});

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

// Google Sign-In using Firebase credential
export const loginWithGoogle = async () => {
  try {
    // Ensure Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Try to sign out to refresh account picker (wrapped in try-catch to handle if not signed in)
    try {
      await GoogleSignin.signOut();
    } catch (signOutError) {
      console.log('Not previously signed in, proceeding with sign in');
    }
    
    // Sign in - this will show all available accounts to choose from
    const response = await GoogleSignin.signIn();

    // Extract the ID token from the response
    const idToken = response?.data?.idToken || response?.idToken;

    if (!idToken) {
      console.error('Google sign-in response:', response);
      throw new Error('Google sign-in failed: missing id token');
    }

    // Exchange Google idToken for Firebase credential
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

    console.log('User logged in with Google:', userCredential.user);
    return {
      success: true,
      user: userCredential.user,
      message: 'Logged in with Google!',
    };
  } catch (error) {
    console.error('Google login error:', error);

    // Provide a user-friendly message
    let errorMessage = 'Google sign-in failed. Please try again.';

    if (error?.code === statusCodes?.SIGN_IN_CANCELLED) {
      errorMessage = 'Google sign-in was cancelled.';
    } else if (error?.code === statusCodes?.IN_PROGRESS) {
      errorMessage = 'Google sign-in is already in progress.';
    } else if (error?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      errorMessage = 'Google Play Services not available or outdated.';
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
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('auth/invalid-email');
    }

    // Configure the action code settings for password reset email
    const actionCodeSettings = {
      url: 'https://saferaastaai.firebaseapp.com/verify-email',
      handleCodeInApp: true,
    };

    // Send password reset email with action code settings
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log('Password reset email sent to:', email);
    console.log('Check spam folder if email not found in inbox');
    
    return {
      success: true,
      message: 'Password reset link sent to your email! Check your inbox and spam folder. The link is valid for 24 hours.'
    };
  } catch (error) {
    console.error('Password reset error code:', error.code);
    console.error('Password reset error message:', error.message);
    
    // Handle specific error cases
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address. Please check and try again or create a new account.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many reset requests. Please try again in a few minutes.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.code === 'auth/internal-error') {
      errorMessage = 'Firebase error. Please ensure your email account exists and try again.';
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