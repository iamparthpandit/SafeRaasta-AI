import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { loginWithEmail, loginWithGoogle } from '../services/authService';

// Icon components (using Unicode characters for simplicity)
const EmailIcon = () => (
  <Image
    source={require('../../assets/images/email.png')}
    style={styles.inputIcon}
  />
);

const LockIcon = () => (
  <Image
    source={require('../../assets/images/lock.png')}
    style={styles.inputIcon}
  />
);


const GoogleIcon = () => (
  <Image 
    source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
    style={{ width: 24, height: 24 }}
  />
);

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmail(email, password);
      console.log('Logged in user:', result.user);
      // Navigate to Landing screen after successful login
      if (navigation) {
        navigation.navigate('Landing');
      }
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      console.log('Google sign-in user:', result.user);
      if (navigation) {
        navigation.navigate('Landing');
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    }
  };

  const handleSignUp = () => {
    if (navigation) {
      navigation.navigate('SignUp');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/login_background.png')}
  style={styles.background}
  imageStyle={styles.backgroundImage}
  resizeMode="cover"
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Login Card */}
        <View style={styles.card}>
          <InputField
            placeholder="Email Address"
            icon={<EmailIcon />}
            value={email}
            onChangeText={setEmail}
          />

          <InputField
            placeholder="Password"
            icon={<LockIcon />}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Log In"
            onPress={handleLogin}
            style={styles.loginButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
{/* Divider */}
<View style={styles.authFooterDivider}>
  <View style={styles.divider} />
</View>

{/* Sign up text */}
         <View style={styles.cardFooter}>
  <Text style={styles.footerText}>
    Don&apos;t have an account?{' '}
    <Text style={styles.signUpText} onPress={handleSignUp}>
      Sign up
    </Text>
  </Text>
</View>
    </View>
</ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
  transform: [
    { translateY: 10 },
    { scale: 1.08 },
  ],
},

inputIcon: {
  width: 26,
  height: 26,
  tintColor: '#413030ff', 
},

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginTop: 220,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2D3B7C',
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#999',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  signUpText: {
    color: '#2D3B7C',
    fontWeight: '600',
  },

authFooterDivider: {
  marginTop: 24,
  marginBottom: 16,
},
cardFooter: {
  alignItems: 'center',
},
});
