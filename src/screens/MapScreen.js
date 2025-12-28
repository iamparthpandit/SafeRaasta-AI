import React from 'react';
import { View, StyleSheet, Text, Alert, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import LocationInputCard from '../components/LocationInputCard';
import FloatingMapButtons from '../components/FloatingMapButtons';
import PlaceSearchModal from '../components/PlaceSearchModal';
import RouteInfo from '../components/RouteInfo';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { getDirections } from '../services/directionsService';

// Default map region (Bengaluru, India)
const DEFAULT_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen({ navigation }) {
  const mapRef = React.useRef(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [fromLocation, setFromLocation] = React.useState('Current Location');
  const [toLocation, setToLocation] = React.useState('Koramangala, Bengaluru');
  const [fromCoords, setFromCoords] = React.useState(null);
  const [toCoords, setToCoords] = React.useState(null);
  const [searchModalVisible, setSearchModalVisible] = React.useState(false);
  const [searchMode, setSearchMode] = React.useState('to'); // 'from' or 'to'

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

  const animateToLocation = (lat, lng, delta = 0.01) => {
    const region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  };

  const handleFromLocationPress = async () => {
    // Offer quick 'Use current location' or search. Delay opening the search modal slightly so the Alert is fully dismissed (fixes focus on Android).
    Alert.alert('Source', undefined, [
      { text: 'Use Current Location', onPress: useCurrentLocation },
      { text: 'Search...', onPress: () => { setTimeout(() => { setSearchMode('from'); setSearchModalVisible(true); }, 220); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleToLocationPress = () => {
    // small delay to ensure UI transitions don't steal focus
    setTimeout(() => { setSearchMode('to'); setSearchModalVisible(true); }, 120);
  };

  const useCurrentLocation = async () => {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert('Permission required', 'Location permission is required to use your location.');
      return;
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFromLocation('Your Location');
        setFromCoords({ latitude, longitude });
        animateToLocation(latitude, longitude, 0.01);
      },
      (err) => {
        console.warn('Location error', err);
        Alert.alert('Location Error', 'Could not fetch current location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const handlePlaceSelected = ({ description, location }) => {
    setSearchModalVisible(false);
    if (!location) return;
    if (searchMode === 'from') {
      setFromLocation(description || 'Selected');
      setFromCoords(location);
      animateToLocation(location.latitude, location.longitude, 0.01);
    } else {
      setToLocation(description || 'Selected');
      setToCoords(location);
      animateToLocation(location.latitude, location.longitude, 0.01);
    }
  };

  // Recalculate routes whenever both coordinates are present
  React.useEffect(() => {
    if (fromCoords && toCoords) {
      fetchAndDrawRoutes(fromCoords, toCoords);
    }
  }, [fromCoords, toCoords]);

  const onSelectAlternative = (idx) => {
    setSelectedRouteIndex(idx);
    const coords = routes[idx]?.coords ?? [];
    if (coords.length && mapRef.current?.fitToCoordinates) {
      mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 80, right: 60, bottom: 220, left: 60 }, animated: true });
    }
  };

  const onMarkerDragEnd = (which, e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (which === 'from') {
      setFromCoords({ latitude, longitude });
      setFromLocation('Dropped Pin');
    } else {
      setToCoords({ latitude, longitude });
      setToLocation('Dropped Pin');
    }
  };

  const [routes, setRoutes] = React.useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = React.useState(0);
  const [loadingRoute, setLoadingRoute] = React.useState(false);

  const handleStartNavigation = () => {
    console.log('Start navigation');
    // TODO: navigate to turn-by-turn screen or start navigation flow
  };

  const fetchAndDrawRoutes = async (origin, destination) => {
    setLoadingRoute(true);
    const { routes: fetched, error } = await getDirections(origin, destination, true);
    setLoadingRoute(false);
    if (error) {
      Alert.alert('Route error', error.toString());
      setRoutes([]);
      return;
    }
    setRoutes(fetched);
    setSelectedRouteIndex(0);

    // auto-fit map to route bounds (primary by default)
    const coords = fetched && fetched.length && fetched[0].coords ? fetched[0].coords : [];
    if (coords.length && mapRef.current?.fitToCoordinates) {
      mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 80, right: 60, bottom: 220, left: 60 }, animated: true });
    }
  };

  const handleMapReady = () => {
    console.log('✓ Map ready - API authenticated successfully');
    setMapReady(true);
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
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
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
      >
          {/* Markers for origin/destination (draggable) */}
        {fromCoords && (
          <Marker coordinate={fromCoords} title="From" pinColor="#2D3B7C" draggable onDragEnd={(e) => onMarkerDragEnd('from', e)} />
        )}
        {toCoords && (
          <Marker coordinate={toCoords} title="To" pinColor="#F55A5A" draggable onDragEnd={(e) => onMarkerDragEnd('to', e)} />
        )}

        {/* Draw routes: primary + alternatives */}
        {routes && routes.length > 0 && routes.map((r, idx) => (
          <Polyline
            key={`route-${idx}`}
            coordinates={r.coords}
            strokeColor={idx === selectedRouteIndex ? '#2D3B7C' : '#A6B2D9'}
            strokeWidth={idx === selectedRouteIndex ? 6 : 4}
            lineDashPattern={idx === selectedRouteIndex ? null : [6, 8]}
            lineCap="round"
          />
        ))}
      </MapView>

      {/* Location input UI */}
      <LocationInputCard
        fromLocation={fromLocation}
        toLocation={toLocation}
        onFromPress={handleFromLocationPress}
        onToPress={handleToLocationPress}
      />

      {/* Search modal */}
      <PlaceSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onPlaceSelected={handlePlaceSelected}
        placeholder={searchMode === 'from' ? 'Search origin' : 'Search destination'}
      />

      {/* Optional: floating buttons */}
      <FloatingMapButtons onRecenter={() => animateToLocation(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude, 0.03)} onCurrentLocation={useCurrentLocation} />

      {/* Route info (distance / duration / alternatives) */}
      {routes && routes.length > 0 && (
        <RouteInfo
          distanceMeters={routes[selectedRouteIndex]?.distance}
          durationSecs={routes[selectedRouteIndex]?.duration}
          alternatives={routes}
          selectedIndex={selectedRouteIndex}
          onSelectAlternative={onSelectAlternative}
          onStart={handleStartNavigation}
        />
      )}
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
