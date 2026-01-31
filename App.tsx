import React, { useState, useEffect } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LandingScreen from './src/screens/LandingScreen';
import MapScreen from './src/screens/MapScreen';

// Disable React DevTools to prevent Text rendering issues in RN 0.83
if (__DEV__) {
  // @ts-ignore
  if (typeof global !== 'undefined' && global.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    // @ts-ignore
    global.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function () {};
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'ForgotPassword' | 'SignUp' | 'Landing' | 'Map'>('Login');

  const navigation = {
    navigate: (screen: 'Login' | 'ForgotPassword' | 'SignUp' | 'Landing' | 'Map') => {
      setCurrentScreen(screen);
    },
    goBack: () => {
      setCurrentScreen('Login');
    },
  };

  if (currentScreen === 'Map') {
    return <MapScreen navigation={navigation} />;
  }

  if (currentScreen === 'Landing') {
    return <LandingScreen navigation={navigation} />;
  }

  if (currentScreen === 'ForgotPassword') {
    return <ForgotPasswordScreen navigation={navigation} />;
  }

  if (currentScreen === 'SignUp') {
    return <SignUpScreen navigation={navigation} />;
  }

  return <LoginScreen navigation={navigation} />;
}