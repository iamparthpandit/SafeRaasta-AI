import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LandingScreen from './src/screens/LandingScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'ForgotPassword' | 'SignUp' | 'Landing'>('Login');

  const navigation = {
    navigate: (screen: 'Login' | 'ForgotPassword' | 'SignUp' | 'Landing') => {
      setCurrentScreen(screen);
    },
    goBack: () => {
      setCurrentScreen('Login');
    },
  };

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
