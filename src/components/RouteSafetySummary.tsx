import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

interface Props {
  selectedRoute: {
    safetyScore: number | null;
    safetyCategory: 'Safe' | 'Moderate' | 'Risky' | null;
    explanation: string[] | null;
    distance: number | null;
    duration: number | null;
    index?: number;
  } | null;
  safestRoute?: {
    index: number;
    safetyScore: number;
    safetyCategory?: 'Safe' | 'Moderate' | 'Risky';
    duration?: number;
  } | null;
  onSwitchToSafer?: () => void;
}

const MAX_EXPLANATIONS = 3;

export default function RouteSafetySummary({ selectedRoute, safestRoute, onSwitchToSafer }: Props) {
  if (!selectedRoute) return null;

  const { safetyScore, safetyCategory, explanation, distance, duration } = selectedRoute;

  const badgeColor = safetyCategory === 'Safe' ? '#00C853' : (safetyCategory === 'Moderate' ? '#FFC107' : (safetyCategory === 'Risky' ? '#FF5252' : colors.primary));
  const badgeLabel = safetyCategory || 'Unknown';

  const bullets = (explanation || []).slice(0, MAX_EXPLANATIONS);

  // CTA logic - use deterministic condition
  const showSaferRouteCTA =
    selectedRoute &&
    selectedRoute.safetyCategory !== 'Safe' &&
    safestRoute &&
    safestRoute.safetyScore > (selectedRoute.safetyScore ?? 0) &&
    safestRoute.index !== (selectedRoute.index ?? null);

  const timeDiffMinutes = (safestRoute && selectedRoute && typeof safestRoute.duration === 'number' && typeof selectedRoute.duration === 'number') ? Math.round((safestRoute.duration - selectedRoute.duration) / 60) : null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.scoreText}>Safety Score: <Text style={styles.scoreValue}>{safetyScore ?? '—'} / 100</Text></Text>
          <View style={styles.rowInfo}>
            <Text style={styles.infoText}>Distance: {distance ? formatDistance(distance) : '—'}</Text>
            <Text style={styles.infoText}>Duration: {duration ? formatDuration(duration) : '—'}</Text>
          </View>

          {bullets && bullets.length > 0 && (
            <View style={styles.explainContainer}>
              {bullets.map((b, i) => (
                <Text key={i} style={styles.bullet}>• {truncate(b, 120)}</Text>
              ))}
            </View>
          )}

          {showSaferRouteCTA && (
            <View style={[styles.ctaContainer, selectedRoute.safetyCategory === 'Risky' ? styles.ctaRisky : styles.ctaModerate]}>
              <Text style={styles.ctaTitle}>Safer route available</Text>
              <Text style={styles.ctaSubtitle}>{timeDiffMinutes !== null ? `Adds ${timeDiffMinutes > 0 ? `+${timeDiffMinutes} min` : '+0 min'} • Much safer` : 'Much safer'}</Text>
              <TouchableOpacity onPress={onSwitchToSafer} style={styles.ctaButtonTouchable}>
                <Text style={[styles.ctaButtonText, selectedRoute.safetyCategory === 'Risky' ? styles.ctaButtonTextRisky : styles.ctaButtonTextModerate]}>Switch to Safer Route</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </View>
  );
}

function truncate(text: string, max: number) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 120,
    zIndex: 11,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  badge: {
    minWidth: 72,
    height: 72,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  scoreText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 6,
  },
  scoreValue: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  rowInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  explainContainer: {
    marginTop: 6,
  },
  bullet: {
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 4,
  },
  ctaContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  ctaTitle: {
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: colors.white,
    marginBottom: 8,
  },
  ctaButtonTouchable: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  ctaButtonText: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  ctaButtonTextModerate: {
    color: '#000',
  },
  ctaButtonTextRisky: {
    color: '#fff',
  },
  ctaModerate: {
    backgroundColor: '#FFEB3B',
  },
  ctaRisky: {
    backgroundColor: '#FF7043',
  },
});