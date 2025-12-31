/**
 * Agent 1: Route Analysis Agent
 * 
 * Purpose: Analyze route structure and extract risk signals
 * Does NOT calculate safety scores - only prepares data for downstream agents
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RouteInput {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  polyline: string; // Encoded Google Maps polyline
  distance: number; // meters
  duration: number; // seconds
  travelTime: 'day' | 'night'; // User's intended travel time
  city: string;
}

export interface RouteSegment {
  id: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  distance: number; // meters
  estimatedDuration: number; // seconds
  segmentType: 'highway' | 'main_road' | 'residential' | 'unknown';
  characteristics: string[];
}

export interface RiskSignal {
  signalType: 
    | 'isolated_segment'
    | 'high_speed_area'
    | 'complex_intersection'
    | 'low_visibility_zone'
    | 'night_travel'
    | 'long_duration'
    | 'unfamiliar_area';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedSegments: string[]; // segment IDs
  metadata: Record<string, any>;
}

export interface RouteAnalysisOutput {
  routeId: string;
  routeSegments: RouteSegment[];
  riskSignals: RiskSignal[];
  metadata: {
    totalDistance: number;
    totalDuration: number;
    segmentCount: number;
    travelTime: 'day' | 'night';
    city: string;
    analysisTimestamp: string;
    polylinePoints: number;
  };
}

// ============================================================================
// CORE AGENT FUNCTION
// ============================================================================

export async function routeAnalysisAgent(
  input: RouteInput
): Promise<RouteAnalysisOutput> {
  const startTime = Date.now();
  
  // 1. Decode polyline to coordinates
  const decodedPoints = decodePolyline(input.polyline);
  
  // 2. Segment the route into logical chunks
  const segments = segmentRoute(decodedPoints, input.distance, input.duration);
  
  // 3. Extract risk signals based on route structure
  const signals = extractRiskSignals(segments, input);
  
  // 4. Generate unique route ID
  const routeId = generateRouteId(input.origin, input.destination, startTime);
  
  return {
    routeId,
    routeSegments: segments,
    riskSignals: signals,
    metadata: {
      totalDistance: input.distance,
      totalDuration: input.duration,
      segmentCount: segments.length,
      travelTime: input.travelTime,
      city: input.city,
      analysisTimestamp: new Date().toISOString(),
      polylinePoints: decodedPoints.length,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Decode Google Maps polyline to lat/lng coordinates
 */
function decodePolyline(polyline: string): Array<{ lat: number; lng: number }> {
  let index = 0;
  const len = polyline.length;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<{ lat: number; lng: number }> = [];

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return coordinates;
}

/**
 * Break route into logical segments based on distance and point distribution
 * Strategy: Create segments every ~500m or at significant direction changes
 */
function segmentRoute(
  points: Array<{ lat: number; lng: number }>,
  totalDistance: number,
  totalDuration: number
): RouteSegment[] {
  if (points.length < 2) return [];
  
  const segments: RouteSegment[] = [];
  const targetSegmentDistance = 500; // meters
  const estimatedSegments = Math.max(Math.ceil(totalDistance / targetSegmentDistance), 1);
  const pointsPerSegment = Math.max(Math.floor(points.length / estimatedSegments), 2);
  
  for (let i = 0; i < points.length - 1; i += pointsPerSegment) {
    const startIdx = i;
    const endIdx = Math.min(i + pointsPerSegment, points.length - 1);
    
    const startPoint = points[startIdx];
    const endPoint = points[endIdx];
    
    // Calculate segment distance (approximation)
    const segmentDistance = calculateDistance(startPoint, endPoint);
    
    // Estimate duration proportionally
    const segmentDuration = (segmentDistance / totalDistance) * totalDuration;
    
    // Classify segment type based on characteristics
    const segmentType = classifySegmentType(segmentDistance, segmentDuration);
    
    // Extract characteristics
    const characteristics = analyzeSegmentCharacteristics(
      points.slice(startIdx, endIdx + 1),
      segmentDistance,
      segmentDuration
    );
    
    segments.push({
      id: `seg_${segments.length + 1}`,
      startPoint,
      endPoint,
      distance: segmentDistance,
      estimatedDuration: segmentDuration,
      segmentType,
      characteristics,
    });
  }
  
  return segments;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;
  
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Classify segment type based on distance and speed
 */
function classifySegmentType(
  distance: number,
  duration: number
): RouteSegment['segmentType'] {
  const avgSpeed = duration > 0 ? (distance / duration) * 3.6 : 0; // km/h
  
  if (avgSpeed > 60) return 'highway';
  if (avgSpeed > 30) return 'main_road';
  if (avgSpeed > 0) return 'residential';
  return 'unknown';
}

/**
 * Analyze segment characteristics from point sequence
 */
function analyzeSegmentCharacteristics(
  points: Array<{ lat: number; lng: number }>,
  distance: number,
  duration: number
): string[] {
  const characteristics: string[] = [];
  
  // Long segment
  if (distance > 1000) {
    characteristics.push('long_segment');
  }
  
  // Complex routing (many points relative to distance)
  const pointDensity = points.length / (distance / 100); // points per 100m
  if (pointDensity > 5) {
    characteristics.push('complex_routing');
  }
  
  // High speed
  const avgSpeed = duration > 0 ? (distance / duration) * 3.6 : 0;
  if (avgSpeed > 50) {
    characteristics.push('high_speed');
  }
  
  // Straight segment
  if (points.length < 5 && distance > 300) {
    characteristics.push('straight_path');
  }
  
  return characteristics;
}

/**
 * Extract risk signals from route structure
 * These are STRUCTURAL signals, not safety scores
 */
function extractRiskSignals(
  segments: RouteSegment[],
  input: RouteInput
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  // Signal 1: Night travel
  if (input.travelTime === 'night') {
    signals.push({
      signalType: 'night_travel',
      severity: 'medium',
      description: 'Route will be traveled during nighttime hours',
      affectedSegments: segments.map(s => s.id),
      metadata: { travelTime: input.travelTime },
    });
  }
  
  // Signal 2: Long duration routes
  if (input.duration > 3600) { // > 1 hour
    signals.push({
      signalType: 'long_duration',
      severity: 'low',
      description: 'Extended travel duration may require additional planning',
      affectedSegments: segments.map(s => s.id),
      metadata: { durationMinutes: Math.round(input.duration / 60) },
    });
  }
  
  // Signal 3: Isolated segments (long straight segments in non-urban areas)
  segments.forEach(seg => {
    if (
      seg.characteristics.includes('long_segment') &&
      seg.characteristics.includes('straight_path') &&
      seg.segmentType === 'highway'
    ) {
      signals.push({
        signalType: 'isolated_segment',
        severity: 'medium',
        description: 'Long isolated highway segment detected',
        affectedSegments: [seg.id],
        metadata: { distance: seg.distance, segmentType: seg.segmentType },
      });
    }
  });
  
  // Signal 4: High-speed areas
  segments.forEach(seg => {
    if (seg.characteristics.includes('high_speed')) {
      signals.push({
        signalType: 'high_speed_area',
        severity: 'low',
        description: 'High-speed road segment',
        affectedSegments: [seg.id],
        metadata: { segmentType: seg.segmentType },
      });
    }
  });
  
  // Signal 5: Complex intersections (high point density)
  segments.forEach(seg => {
    if (seg.characteristics.includes('complex_routing')) {
      signals.push({
        signalType: 'complex_intersection',
        severity: 'low',
        description: 'Complex routing with multiple turns',
        affectedSegments: [seg.id],
        metadata: { distance: seg.distance },
      });
    }
  });
  
  return signals;
}

/**
 * Generate unique route ID
 */
function generateRouteId(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  timestamp: number
): string {
  const hash = `${origin.lat.toFixed(4)}_${origin.lng.toFixed(4)}_${destination.lat.toFixed(4)}_${destination.lng.toFixed(4)}_${timestamp}`;
  return `route_${hash.replace(/\./g, '')}`;
}

// ============================================================================
// EXAMPLE USAGE (for testing)
// ============================================================================

/*
const testInput: RouteInput = {
  origin: { lat: 19.0760, lng: 72.8777 }, // Mumbai
  destination: { lat: 19.1176, lng: 72.9060 },
  polyline: 'encodedPolylineString',
  distance: 5000,
  duration: 900,
  travelTime: 'night',
  city: 'Mumbai',
};

const analysis = await routeAnalysisAgent(testInput);
console.log(analysis);
*/