import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import colors from '../theme/colors';

export default function FloatingMapButtons() {
  return (
    <View style={styles.container}>
      {/* Navigation/Recenter Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log('Recenter map')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>🧭</Text>
      </TouchableOpacity>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log('Go to current location')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 420,
    gap: 12,
    zIndex: 998,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonIcon: {
    fontSize: 24,
  },
});
