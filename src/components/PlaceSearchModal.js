import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { GOOGLE_API_KEY } from '../config/keys';
import colors from '../theme/colors';

// NOTE: Replace 'YOUR_GOOGLE_API_KEY' below with your actual Google API key
// and enable the Places API in Google Cloud Console. For Android, ensure the
// API key is set in AndroidManifest.xml; for iOS add it in AppDelegate or Info.plist as required.

export default function PlaceSearchModal({ visible, onClose, onPlaceSelected, placeholder = 'Search' }) {
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const res = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return res === RESULTS.GRANTED;
      } else {
        const res = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return res === RESULTS.GRANTED;
      }
    } catch (e) {
      console.warn('Permission request failed', e);
      return false;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} presentationStyle="overFullScreen" hardwareAccelerated onRequestClose={onClose}>
      <View style={styles.overlayFull}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{placeholder}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <GooglePlacesAutocomplete
              placeholder={placeholder}
              minLength={2}
              debounce={300}
              fetchDetails={true}
              listViewDisplayed={'auto'}
              keyboardShouldPersistTaps="handled"
              textInputProps={{ autoFocus: true, clearButtonMode: 'while-editing', placeholderTextColor: '#6b6b6b', returnKeyType: 'search' }}
              onPress={async (data, details = null) => {
                // If the user tapped the 'Use Current Location' row, attempt to get location after granting permission
                if (data?.description && data.description.toLowerCase().includes('current')) {
                  const granted = await requestLocationPermission();
                  if (!granted) {
                    Alert.alert('Permission required', 'Location permission is required to use your location.');
                    return;
                  }

                  Geolocation.getCurrentPosition(
                    (pos) => {
                      const { latitude, longitude } = pos.coords;
                      onPlaceSelected?.({ description: 'Your Location', location: { latitude, longitude } });
                    },
                    (err) => {
                      console.warn('Geolocation error', err);
                      Alert.alert('Location Error', 'Could not fetch current location.');
                      onPlaceSelected?.({ description: 'Your Location', location: null });
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                  return;
                }

                const lat = details?.geometry?.location?.lat;
                const lng = details?.geometry?.location?.lng;
                if (lat && lng) {
                  onPlaceSelected?.({ description: data.description, location: { latitude: lat, longitude: lng } });
                } else {
                  onPlaceSelected?.({ description: data.description, location: null });
                }
              }}
              query={{
                key: GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY',
                language: 'en',
                types: 'geocode',
              }}
              styles={{
                textInputContainer: { width: '100%', backgroundColor: '#fff', padding: 8 },
                textInput: { height: 48, color: '#1a1a1a', fontSize: 16, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f7f7f8' },
                listView: styles.listView,
                description: { color: '#6b6b6b' },
              }}
              currentLocation={true}
              currentLocationLabel="Use Current Location"
              currentLocationAPI="geolocation"
              enablePoweredByContainer={false}
              nearbyPlacesAPI="GooglePlacesSearch"
              renderRow={(data) => {
                const main = data?.structured_formatting?.main_text || data.description;
                const secondary = data?.structured_formatting?.secondary_text || null;
                return (
                  <View style={styles.suggestionRow}>
                    <View style={styles.suggestionIcon}><Text style={{fontSize:16}}>📍</Text></View>
                    <View style={styles.suggestionText}>
                      <Text style={styles.suggestionMain}>{main}</Text>
                      {secondary ? <Text style={styles.suggestionSecondary}>{secondary}</Text> : null}
                    </View>
                  </View>
                );
              }}
              renderLeftButton={() => <View style={{width:8}} />}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayFull: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'flex-start',
  },
  container: {
    marginTop: 80,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '700' },
  closeButton: { padding: 6 },
  closeText: { color: colors.primary, fontWeight: '700' },
  listView: {
    backgroundColor: colors.white,
    maxHeight: 320,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },
  suggestionSecondary: {
    fontSize: 13,
    color: '#6b6b6b',
    marginTop: 2,
  },
});