import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function RouteInfo({ distanceMeters, durationSecs, alternatives = [], selectedIndex = 0, onSelectAlternative, onStart }) {
  const distanceKm = distanceMeters ? (distanceMeters / 1000).toFixed(1) : '--';
  const durationMin = durationSecs ? Math.round(durationSecs / 60) : '--';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{distanceKm} km</Text>
        </View>

        <View>
          <Text style={styles.label}>ETA</Text>
          <Text style={styles.value}>{durationMin} min</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>

      {alternatives && alternatives.length > 1 && (
        <View style={styles.altRow}>
          {alternatives.map((alt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.altChip, idx === selectedIndex && styles.altChipActive]}
              onPress={() => onSelectAlternative?.(idx)}
            >
              <Text style={[styles.altText, idx === selectedIndex && styles.altTextActive]}>{idx === 0 ? 'Primary' : 'Alt #' + idx}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 30,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    elevation: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  startText: { color: colors.white, fontWeight: '700' },
  altRow: { marginTop: 12, flexDirection: 'row', gap: 8 },
  altChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F5F5F7' },
  altChipActive: { backgroundColor: colors.primary },
  altText: { color: colors.text.primary, fontWeight: '600' },
  altTextActive: { color: colors.white },
});