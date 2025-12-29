import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function LocationInputCard({ 
  fromLocation = 'Current Location',
  toLocation = 'Koramangala, Bengaluru',
  onFromPress,
  onToPress,
}) {
  const [selectedTime, setSelectedTime] = useState('now');

  return (
    <View style={styles.container}>
      {/* From Location */}
      <TouchableOpacity 
        style={styles.locationRow}
        onPress={() => {
          console.log('Select source location');
          onFromPress?.();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={styles.fromIcon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
        </View>
        <View style={styles.inputContent}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.locationText}>{fromLocation}</Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* To Location */}
      <TouchableOpacity 
        style={styles.locationRow}
        onPress={() => {
          console.log('Select destination');
          onToPress?.();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={styles.toIcon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
        </View>
        <View style={styles.inputContent}>
          <Text style={styles.label}>To</Text>
          <Text style={styles.locationText}>{toLocation}</Text>
        </View>
      </TouchableOpacity>

      {/* Time Selection */}
      <View style={styles.timeContainer}>
        <TouchableOpacity
          style={[
            styles.timeButton,
            selectedTime === 'now' && styles.timeButtonActive
          ]}
          onPress={() => {
            setSelectedTime('now');
            console.log('Time: Now');
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.timeButtonText,
            selectedTime === 'now' && styles.timeButtonTextActive
          ]}>
            Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeButton,
            selectedTime === 'custom' && styles.timeButtonActive
          ]}
          onPress={() => {
            setSelectedTime('custom');
            console.log('Time: Custom');
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.timeButtonText,
            selectedTime === 'custom' && styles.timeButtonTextActive
          ]}>
            Custom Time
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
<<<<<<< HEAD
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    zIndex: 999,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
=======
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    zIndex: 999,
    elevation: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
>>>>>>> origin/publish/to-iamparthpandit
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  fromIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  inputContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  timeButtonTextActive: {
    color: colors.white,
  },
});
