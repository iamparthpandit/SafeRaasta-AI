import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'SafeRaasta needs access to your location to provide safe route navigation',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true;
      } else {
        console.log('Location permission denied');
        Alert.alert(
          'Permission Required',
          'Location permission is required to use this app. Please enable it in settings.'
        );
        return false;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      
      if (result === RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true;
      } else {
        console.log('Location permission denied');
        Alert.alert(
          'Permission Required',
          'Location permission is required to use this app. Please enable it in settings.'
        );
        return false;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
  
  return false;
};

export const checkLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result;
    } catch (err) {
      console.warn('Permission check error:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return result === RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission check error:', err);
      return false;
    }
  }
  
  return false;
};
