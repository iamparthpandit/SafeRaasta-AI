import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapHeader from '../components/MapHeader';
import LocationInputCard from '../components/LocationInputCard';
import FloatingMapButtons from '../components/FloatingMapButtons';
import RouteSafetySheet from '../components/RouteSafetySheet';

// Default map region (Bengaluru, India)
const DEFAULT_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen({ navigation }) {
  const [mapReady, setMapReady] = React.useState(false);
  
  const handleProfilePress = () => {
    console.log('Navigate to profile');
  };

  const handleFromLocationPress = () => {
    console.log('Select source location');
  };

  const handleToLocationPress = () => {
    console.log('Select destination location');
  };

  const handleStartNavigation = () => {
    console.log('Start safer navigation');
  };

  const handleMapReady = () => {
    console.log('✓ Map ready - API authenticated successfully');
    setMapReady(true);
    Alert.alert('Success!', 'Map loaded successfully!');
  };

  const handleMapError = (error) => {
    console.error('✗ Map error:', JSON.stringify(error));
    Alert.alert(
      'Map Error', 
      'API Key Issue:\n\n1. Enable "Maps SDK for Android" in Google Cloud Console\n2. Check API key restrictions\n3. Rebuild app after changes'
    );
  };

  React.useEffect(() => {
    console.log('MapScreen mounted');
    console.log('API Key in AndroidManifest: AIzaSyBAG9ee_Yr-txzHbiazTgFoLWa2bgpX5T4');
    console.log('Package name: com.saferaasta');
    console.log('If map is black, enable Maps SDK for Android in console');
  }, []);

  return (
    <View style={styles.container}>
      {/* ONLY GOOGLE MAPS - NO OTHER UI */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        loadingEnabled={true}
        loadingIndicatorColor="#2D3B7C"
        onMapReady={handleMapReady}
        onError={handleMapError}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        mapType="standard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
