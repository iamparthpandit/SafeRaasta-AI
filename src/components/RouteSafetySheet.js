import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import colors from '../theme/colors';

export default function RouteSafetySheet({ onStartNavigation }) {
  return (
    <View style={styles.container}>
      {/* Drag Handle */}
      <View style={styles.handle} />

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Safety Score */}
        <Text style={styles.scoreTitle}>Route Safety Score</Text>
        
        <View style={styles.scoreContainer}>
          <View style={styles.riskIndicator} />
          <Text style={styles.riskLevel}>Moderate Risk</Text>
        </View>

        {/* Risk Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why this route is risky</Text>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Low activity at night (after 10 PM)</Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Isolated road segments on Route 2</Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Past incident patterns detected</Text>
          </View>
        </View>

        {/* Start Navigation Button */}
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => {
            console.log('Start safer navigation pressed');
            onStartNavigation?.();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.navigationButtonText}>Start Safer Navigation</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    zIndex: 997,
    elevation: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  riskIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.risk.moderate,
    marginRight: 12,
  },
  riskLevel: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  reasonsContainer: {
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  reasonsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: colors.text.primary,
    marginRight: 12,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  navigationButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
