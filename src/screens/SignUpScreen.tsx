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
import { signUpWithEmail } from '../services/authService';

interface SignUpScreenProps {
  navigation?: any;
}

// Icon components
const UserIcon = () => (
  <Image
    source={require('../../assets/images/person.png')}
    style={styles.inputIcon}
  />
);

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

interface SignUpScreenProps {
  navigation?: any;
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Basic validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password);
      console.log('New user created:', result.user);
      // TODO: Save fullName to Firestore/profile later
      // Navigate to Landing screen after successful signup
      if (navigation) {
        navigation.navigate('Landing');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In will be implemented soon!',
      [{ text: 'OK' }]
    );
  };

  const handleLogIn = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/sign_up_bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sign Up Card */}
        <View style={styles.card}>
          <InputField
            placeholder="Full Name"
            icon={<UserIcon />}
            value={fullName}
            onChangeText={setFullName}
          />

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

          <InputField
            placeholder="Confirm Password"
            icon={<LockIcon />}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <PrimaryButton
            title="Sign Up"
            onPress={handleSignUp}
            style={styles.signUpButton}
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

          <View style={styles.thinDivider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.loginText} onPress={handleLogIn}>
                Log in
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
    width: '100%',
    height: '100%',
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
    marginTop:250,
  },

  inputIcon: {
    width: 20,
    height: 20,
  },

  signUpButton: {
    marginTop: 8,
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
    marginBottom: 20,
  },

  googleButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },

  thinDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },

  footer: {
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: '#666',
  },

  loginText: {
    color: '#2D3B7C',
    fontWeight: '600',
  },
});
