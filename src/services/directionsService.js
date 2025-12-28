// Lightweight Directions service that calls Google Directions API
// Returns an object: { routes: [{ polylineCoords, distance, duration, summary }], error }

import { GOOGLE_API_KEY } from '../config/keys';

// decode encoded polyline into [{latitude, longitude}, ...]
export function decodePolyline(encoded) {
  if (!encoded) return [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  const coordinates = [];

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
}

export async function getDirections(origin, destination, alternatives = true) {
  // origin & destination should be { latitude, longitude }
  if (!origin || !destination) return { routes: [], error: 'Missing coordinates' };
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}&alternatives=${alternatives ? 'true' : 'false'}&key=${GOOGLE_API_KEY}`;
    const resp = await fetch(url);
    const json = await resp.json();

    if (json.status !== 'OK' || !json.routes) {
      return { routes: [], error: json.status || 'Directions error' };
    }

    const routes = json.routes.map((r) => {
      const overview = r.overview_polyline?.points;
      const coords = decodePolyline(overview);
      const leg = r.legs && r.legs.length ? r.legs[0] : null;
      const distance = leg?.distance?.value ?? null; // meters
      const duration = leg?.duration?.value ?? null; // seconds
      const summary = r.summary || '';
      return {
        coords,
        distance, // meters
        duration, // seconds
        summary,
      };
    });

    return { routes, error: null };
  } catch (e) {
    console.warn('Directions fetch failed', e);
    return { routes: [], error: e.message };
  }
}
