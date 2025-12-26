import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

// Email icon component
const EmailIcon = () => (
  <Image
    source={require('../../assets/images/email.png')}
    style={styles.inputIcon}
    resizeMode="contain"
  />
);


interface ForgotPasswordScreenProps {
  navigation?: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    console.log('Send reset link to:', email);
    // Firebase logic will be added later
  };

  const handleBackToLogin = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/forgot_password_bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and Header */}
        {/* Card */}
        <View style={styles.card}>
          <InputField
            placeholder="Email Address"
            icon={<EmailIcon />}
            value={email}
            onChangeText={setEmail}
          />

          <PrimaryButton
            title="Send Reset Link"
            onPress={handleSendResetLink}
            style={styles.resetButton}
          />

          <View style={styles.divider} />

          <TouchableOpacity 
            onPress={handleBackToLogin}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back to Log In</Text>
          </TouchableOpacity>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
    marginTop: 270
  },
  resetButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 24,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#2D3B7C',
    fontWeight: '500',
  },
  inputIcon: {
  width: 22,
  height: 22,
  tintColor: '#666', // optional, remove if image already colored
},
});
