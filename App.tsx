import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'ForgotPassword'>('Login');

  const navigation = {
    navigate: (screen: 'Login' | 'ForgotPassword') => {
      setCurrentScreen(screen);
    },
    goBack: () => {
      setCurrentScreen('Login');
    },
  };

  if (currentScreen === 'ForgotPassword') {
    return <ForgotPasswordScreen navigation={navigation} />;
  }

  return <LoginScreen navigation={navigation} />;
}
