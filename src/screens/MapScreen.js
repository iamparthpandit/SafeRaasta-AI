import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getDirections } from '../services/directionsService';
import { GOOGLE_API_KEY } from '../config/keys';
import { requestLocationPermission } from '../services/permissionsService';
import colors from '../theme/colors';

export default function MapScreen() {
  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const cardAnimValue = useRef(new Animated.Value(1)).current;

  // Location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originText, setOriginText] = useState('Current Location');
  const [destinationText, setDestinationText] = useState('');

  // Route states
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Get current location on mount
  useEffect(() => {
    requestPermissionAndGetLocation();
  }, []);

  const requestPermissionAndGetLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(location);
        setOrigin(location);
      },
      (error) => {
        console.log('Location error:', error);
        Alert.alert('Location Error', 'Unable to get current location');
        // Default to Bangalore
        const defaultLocation = { latitude: 12.9716, longitude: 77.5946 };
        setCurrentLocation(defaultLocation);
        setOrigin(defaultLocation);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Fetch route when both origin and destination are set
  useEffect(() => {
    if (origin && destination) {
      fetchRoute();
    }
  }, [origin, destination]);

  const fetchRoute = async () => {
    console.log('Fetching route from', origin, 'to', destination);
    setLoading(true); // FIX: Added missing setLoading(true)
    try {
      const result = await getDirections(origin, destination, true);
      
      console.log('Route result:', result);
      
      if (result.error) {
        Alert.alert('Route Error', result.error);
        setRoutes([]);
        setSelectedRoute(null);
      } else if (result.routes && result.routes.length > 0) {
        console.log('Routes found:', result.routes.length);
        console.log('First route coords length:', result.routes[0].coords?.length);
        console.log('First route distance:', result.routes[0].distance);
        setRoutes(result.routes);
        setSelectedRoute(result.routes[0]);
        
        // Extract navigation steps from the route
        if (result.routes[0].steps) {
          setNavigationSteps(result.routes[0].steps);
        }
        
        // Fit map to show the route
        if (mapRef.current && result.routes[0].coords && result.routes[0].coords.length > 0) {
          setTimeout(() => {
            mapRef.current.fitToCoordinates(result.routes[0].coords, {
              edgePadding: { top: 200, right: 60, bottom: 400, left: 60 },
              animated: true,
            });
          }, 500);
        }
      } else {
        console.log('No routes found');
        Alert.alert('No Route', 'No route found between these locations');
      }
    } catch (error) {
      console.error('Route fetch error:', error);
      Alert.alert('Error', 'Failed to fetch route: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOriginSelect = (data, details) => {
    if (details && details.geometry) {
      const location = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setOrigin(location);
      setOriginText(data.description);
    }
  };

  const handleDestinationSelect = (data, details) => {
    if (details && details.geometry) {
      const location = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setDestination(location);
      setDestinationText(data.description);
      
      // Animate map to show both origin and destination
      if (mapRef.current && origin) {
        setTimeout(() => {
          mapRef.current.fitToCoordinates([origin, location], {
            edgePadding: { top: 200, right: 60, bottom: 400, left: 60 },
            animated: true,
          });
        }, 300);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
    setOriginText('Current Location');
  };

  const startNavigation = () => {
    if (!selectedRoute || !selectedRoute.coords || selectedRoute.coords.length === 0) {
      Alert.alert('No Route', 'Please wait for the route to be calculated');
      return;
    }
    
    // First, fit the map to show the full route with proper padding for navigation panel
    if (mapRef.current && selectedRoute.coords.length > 0) {
      mapRef.current.fitToCoordinates(selectedRoute.coords, {
        edgePadding: { top: 300, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
    
    // Animate card out and navigation panel in
    Animated.timing(cardAnimValue, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setIsNavigating(true);
    });
  };

  const stopNavigation = () => {
    // Animate card back in
    Animated.timing(cardAnimValue, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    // Reset navigation state after animation starts
    setTimeout(() => {
      setIsNavigating(false);
      setSelectedRoute(null);
      setRoutes([]);
      setDestination(null);
      setDestinationText('');
      setCurrentStepIndex(0);
      
      // Zoom back to current location
      if (mapRef.current && currentLocation) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    }, 200);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.headerTitle}>SafeRaasta AI</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 12.9716,
          longitude: currentLocation?.longitude || 77.5946,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={isNavigating}
      >
        {/* Origin Marker */}
        {origin && !isNavigating && (
          <Marker
            coordinate={origin}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.originMarker} />
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={destination}
            pinColor={colors.primary}
          />
        )}

        {/* Route Polyline */}
        {selectedRoute && selectedRoute.coords && selectedRoute.coords.length > 0 && (
          <Polyline
            coordinates={selectedRoute.coords}
            strokeWidth={isNavigating ? 6 : 5}
            strokeColor={isNavigating ? '#4285F4' : colors.primary}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Input Card - Hide during navigation */}
      {!isNavigating && (
        <Animated.View
          style={[
            styles.inputCard,
            {
              opacity: cardAnimValue,
              transform: [
                {
                  translateY: cardAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-150, 0],
                  }),
                },
                {
                  scale: cardAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.inputContainer}>
            {/* Origin Input */}
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <View style={styles.originIcon} />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>From</Text>
                <GooglePlacesAutocomplete
                  ref={originInputRef}
                  placeholder="Current Location"
                  onPress={handleOriginSelect}
                  query={{
                    key: GOOGLE_API_KEY,
                    language: 'en',
                    components: 'country:in',
                  }}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  styles={autocompleteStyles}
                  debounce={300}
                  minLength={2}
                  predefinedPlaces={[
                    {
                      description: 'Current Location',
                      geometry: { location: { lat: currentLocation?.latitude || 12.9716, lng: currentLocation?.longitude || 77.5946 } },
                    },
                  ]}
                  renderRightButton={() => (
                    <TouchableOpacity 
                      onPress={handleUseCurrentLocation}
                      style={styles.currentLocationBtn}
                    >
                      <Text style={styles.currentLocationText}>📍</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            {/* Destination Input */}
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <View style={styles.destinationIcon}>
                  <Text style={styles.pinText}>📍</Text>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>To</Text>
                <GooglePlacesAutocomplete
                  ref={destinationInputRef}
                  placeholder="Enter destination"
                  onPress={handleDestinationSelect}
                  query={{
                    key: GOOGLE_API_KEY,
                    language: 'en',
                    components: 'country:in',
                  }}
                  fetchDetails={true}
                  enablePoweredByContainer={false}
                  styles={autocompleteStyles}
                  debounce={300}
                  minLength={2}
                  nearbyPlacesAPI="GooglePlacesSearch"
                  listViewDisplayed="auto"
                />
              </View>
            </View>

            {/* Start Navigation Button - Always visible */}
            <TouchableOpacity 
              style={styles.startNavigationBtn}
              onPress={startNavigation}
              activeOpacity={0.8}
            >
              <Text style={styles.startNavigationBtnText}>
                🚗 Start Navigation
              </Text>
            </TouchableOpacity>

            {/* Loading indicator when fetching route */}
            {loading && (
              <View style={styles.loadingRouteContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingRouteText}>Finding best route...</Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Navigation Info Panel */}
      {isNavigating && selectedRoute && (
        <Animated.View 
          style={[
            styles.navigationPanel,
            {
              opacity: cardAnimValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateY: cardAnimValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -150],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.navigationHeader}>
            <View style={styles.navigationInfo}>
              <Text style={styles.navigationDistance}>
                {formatDistance(selectedRoute.distance)}
              </Text>
              <Text style={styles.navigationDuration}>
                {formatDuration(selectedRoute.duration)} • ETA {new Date(Date.now() + selectedRoute.duration * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.stopNavigationBtn}
              onPress={stopNavigation}
            >
              <Text style={styles.stopNavigationText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.navigationDirections}>
            <View style={styles.routeInfoRow}>
              <View style={styles.routeDot} />
              <Text style={styles.routeText} numberOfLines={1}>{originText}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeInfoRow}>
              <View style={[styles.routeDot, styles.destinationDot]} />
              <Text style={styles.routeText} numberOfLines={1}>{destinationText}</Text>
            </View>
          </View>

          <View style={styles.navigationStatusContainer}>
            <Text style={styles.navigationInstruction}>
              🧭 Navigating to destination
            </Text>
            <Text style={styles.navigationSubtext}>
              Following the safest route
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlButton}>
          <Text style={styles.mapControlIcon}>🧭</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapControlButton}
          onPress={getCurrentLocation}
        >
          <Text style={styles.mapControlIcon}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  inputCard: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    zIndex: 9,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputContainer: {
    gap: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  originIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
  },
  destinationIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinText: {
    fontSize: 20,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  currentLocationBtn: {
    padding: 5,
  },
  currentLocationText: {
    fontSize: 18,
  },
  startNavigationBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startNavigationBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  routeInfoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  routeInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  routeInfoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  routeInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  routeInfoDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  loadingRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  loadingRouteText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  originMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    borderWidth: 3,
    borderColor: colors.white,
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    gap: 10,
    zIndex: 5,
  },
  mapControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mapControlIcon: {
    fontSize: 24,
  },
  navigationPanel: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navigationInfo: {
    flex: 1,
  },
  navigationDistance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  navigationDuration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  stopNavigationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNavigationText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  navigationDirections: {
    marginBottom: 15,
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: colors.primary,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 5,
  },
  routeText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  navigationStatusContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  navigationInstruction: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  navigationSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

const autocompleteStyles = {
  container: {
    flex: 0,
  },
  textInput: {
    height: 40,
    fontSize: 16,
    color: colors.text.primary,
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  listView: {
    position: 'absolute',
    top: 45,
    left: -50,
    right: -20,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    maxHeight: 200,
  },
  row: {
    padding: 13,
    height: 50,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  description: {
    fontSize: 14,
    color: colors.text.primary,
  },
  loader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 20,
  },
};