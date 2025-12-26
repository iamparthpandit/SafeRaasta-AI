import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

// Slide data with different taglines and background images
const SLIDES = [
  {
    id: 1,
    backgroundImage: require('../../assets/images/landing_bg_1.png'),
    buttonOffset: 0,
    dotsOffset: 0,
  },
  {
    id: 2,
    backgroundImage: require('../../assets/images/landing_bg_2.png'),
    buttonOffset: -20,
    dotsOffset: -10,
  },
  {
    id: 3,
    backgroundImage: require('../../assets/images/landing_bg_3.png'),
    buttonOffset: -30,
    dotsOffset: -15,
  },
];


export default function LandingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change slide
        setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
        
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2500); // Auto-slide every 2.5 seconds

    return () => clearInterval(timer);
  }, [fadeAnim]);

  const handleCheckRouteSafety = () => {
    console.log('Check Route Safety pressed');
    // TODO: Navigate to route safety screen
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      {/* Animated Background Image */}
      <Animated.View style={[styles.backgroundContainer, { opacity: fadeAnim }]}>
        <ImageBackground
          source={currentSlide.backgroundImage}
          style={styles.background}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Static Content Overlay */}
      <View style={styles.contentContainer}>
        {/* Middle Section - Illustration Space (handled by background) */}
        <View style={styles.middleSection} />

        {/* Bottom Section - Button and Pagination */}
        <View style={styles.bottomSection}>
          <PrimaryButton
  title="Check Route Safety"
  onPress={handleCheckRouteSafety}
  style={[
    styles.ctaButton,
    { marginTop: currentSlide.buttonOffset }
  ]}
/>

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  background: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3B7C',
    marginBottom: 16,
  },
  brandTitleAI: {
    color: '#4CAF50',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  middleSection: {
    flex: 1,
    // Illustration space - handled by background image
  },
  bottomSection: {
  position: 'absolute',
  bottom: height * 0.12,   // 🔑 MAGIC LINE
  width: '100%',
  alignItems: 'center',
},
  ctaButton: {
    width: width - 48,
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D3B7C',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
