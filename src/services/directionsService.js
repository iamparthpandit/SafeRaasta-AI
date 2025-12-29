// Google Directions Service
// Returns:
// {
//   routes: [
//     {
//       index,
//       coords,
//       distance,   // meters
//       duration,   // seconds
//       summary,
//       bounds
//     }
//   ],
//   error
// }

import { GOOGLE_API_KEY } from '../config/keys';

/* ---------------- Polyline Decoder ---------------- */

export function decodePolyline(encoded) {
  if (!encoded) return [];

  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

/* ---------------- Directions Fetch ---------------- */

export async function getDirections(origin, destination, alternatives = true) {
  if (!origin || !destination) {
    return { routes: [], error: 'Missing origin or destination coordinates' };
  }

  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;

    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${encodeURIComponent(originStr)}` +
      `&destination=${encodeURIComponent(destStr)}` +
      `&alternatives=${alternatives ? 'true' : 'false'}` +
      `&key=${GOOGLE_API_KEY}`;

    const resp = await fetch(url);
    const json = await resp.json();

    if (json.status !== 'OK') {
      return {
        routes: [],
        error: `Directions API error: ${json.status}`,
      };
    }

    const routes = json.routes.map((route, index) => {
      const leg = route.legs?.[0];

      return {
        index,
        coords: decodePolyline(route.overview_polyline?.points),
        distance: leg?.distance?.value ?? 0,
        duration: leg?.duration?.value ?? 0,
        summary: route.summary || '',
        bounds: route.bounds || null,
      };
    });

    return { routes, error: null };
  } catch (error) {
    console.error('Directions fetch failed:', error);
    return {
      routes: [],
      error: error.message || 'Network error while fetching directions',
    };
  }
}