/**
 * Agent 1: Route Analysis Agent
 *
 * Purpose:
 * - Analyze route structure
 * - Extract ONLY structural risk signals
 * - Prepare clean, deterministic data for downstream agents
 *
 * IMPORTANT:
 * - Does NOT calculate safety scores
 * - Does NOT apply night/day penalties
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
  travelTime: 'day' | 'night';
  city: string;
}

export interface RouteSegment {
  id: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  distance: number;
  estimatedDuration: number;
  segmentType: 'highway' | 'main_road' | 'residential' | 'unknown';
  characteristics: string[];
}

export interface RiskSignal {
  signalType:
    | 'isolated_segment'
    | 'high_speed_area'
    | 'complex_intersection'
    | 'urban_dense_area';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedSegments: string[];
  metadata: Record<string, any>;
}

export interface RouteAnalysisOutput {
  routeId: string;
  routeSegments: RouteSegment[];
  riskSignals: RiskSignal[];
  structuralStats: {
    isolatedSegments: number;
    highSpeedSegments: number;
    complexSegments: number;
    totalSegments: number;
  };
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
  const timestamp = Date.now();

  // 1. Decode polyline
  const decodedPoints = decodePolyline(input.polyline);

  // 2. Segment route
  const segments = segmentRoute(decodedPoints, input.distance, input.duration);

  // 3. Extract structural risk signals
  const riskSignals = extractRiskSignals(segments);

  // 4. Structural stats (used by scoring agent)
  const structuralStats = {
    isolatedSegments: riskSignals.filter(
      s => s.signalType === 'isolated_segment'
    ).length,
    highSpeedSegments: riskSignals.filter(
      s => s.signalType === 'high_speed_area'
    ).length,
    complexSegments: riskSignals.filter(
      s => s.signalType === 'complex_intersection'
    ).length,
    totalSegments: segments.length,
  };

  // 5. Generate route ID
  const routeId = generateRouteId(
    input.origin,
    input.destination,
    timestamp
  );

  return {
    routeId,
    routeSegments: segments,
    riskSignals,
    structuralStats,
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

function decodePolyline(
  polyline: string
): Array<{ lat: number; lng: number }> {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<{ lat: number; lng: number }> = [];

  while (index < polyline.length) {
    let b, shift = 0, result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

function segmentRoute(
  points: Array<{ lat: number; lng: number }>,
  totalDistance: number,
  totalDuration: number
): RouteSegment[] {
  if (points.length < 2) return [];

  const segments: RouteSegment[] = [];
  const targetSegmentDistance = 500;
  const segmentCount = Math.max(
    Math.ceil(totalDistance / targetSegmentDistance),
    1
  );
  const pointsPerSegment = Math.max(
    Math.floor(points.length / segmentCount),
    2
  );

  for (let i = 0; i < points.length - 1; i += pointsPerSegment) {
    const start = points[i];
    const end = points[Math.min(i + pointsPerSegment, points.length - 1)];
    const distance = calculateDistance(start, end);
    const duration = (distance / totalDistance) * totalDuration;
    const segmentType = classifySegmentType(distance, duration);
    const characteristics = analyzeSegmentCharacteristics(
      points.slice(i, i + pointsPerSegment + 1),
      distance,
      duration
    );

    segments.push({
      id: `seg_${segments.length + 1}`,
      startPoint: start,
      endPoint: end,
      distance,
      estimatedDuration: duration,
      segmentType,
      characteristics,
    });
  }

  return segments;
}

function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371e3;
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifySegmentType(
  distance: number,
  duration: number
): RouteSegment['segmentType'] {
  const speed = duration > 0 ? (distance / duration) * 3.6 : 0;

  if (speed > 70) return 'highway';
  if (speed > 40) return 'main_road';
  if (speed > 0) return 'residential';
  return 'unknown';
}

function analyzeSegmentCharacteristics(
  points: Array<{ lat: number; lng: number }>,
  distance: number,
  duration: number
): string[] {
  const characteristics: string[] = [];
  const speed = duration > 0 ? (distance / duration) * 3.6 : 0;

  if (distance > 1000) characteristics.push('long_segment');
  if (speed > 70) characteristics.push('high_speed');
  if (points.length < 5 && distance > 300)
    characteristics.push('straight_path');

  const density = points.length / (distance / 100);
  if (density > 5) characteristics.push('complex_routing');

  return characteristics;
}

function extractRiskSignals(
  segments: RouteSegment[]
): RiskSignal[] {
  const signals: RiskSignal[] = []
// ---------- URBAN DENSITY DETECTION ----------
const urbanSegments = segments.filter(
  s =>
    (s.segmentType === 'main_road' || s.segmentType === 'residential') &&
    s.distance < 800 &&
    s.characteristics.includes('complex_routing')
);

const highwaySegments = segments.filter(
  s => s.segmentType === 'highway'
);

// If route is mostly urban and not highway-dominated
if (
  urbanSegments.length >= Math.max(3, segments.length * 0.4) &&
  highwaySegments.length === 0
) {
  signals.push({
    signalType: 'urban_dense_area',
    severity: 'low',
    description: 'Route passes through dense urban areas with regular activity',
    affectedSegments: urbanSegments.map(s => s.id),
    metadata: {
      urbanSegmentCount: urbanSegments.length,
      totalSegments: segments.length,
    },
  });
}

  segments.forEach(seg => {
    if (
      seg.segmentType === 'highway' &&
      seg.distance > 1200 &&
      seg.characteristics.includes('straight_path')
    ) {
      signals.push({
        signalType: 'isolated_segment',
        severity: 'medium',
        description: 'Long isolated highway segment detected',
        affectedSegments: [seg.id],
        metadata: { distance: seg.distance },
      });
    }

    if (seg.characteristics.includes('high_speed')) {
      signals.push({
        signalType: 'high_speed_area',
        severity: 'low',
        description: 'High-speed road segment',
        affectedSegments: [seg.id],
        metadata: {},
      });
    }

    if (seg.characteristics.includes('complex_routing')) {
      signals.push({
        signalType: 'complex_intersection',
        severity: 'low',
        description: 'Complex routing with multiple turns',
        affectedSegments: [seg.id],
        metadata: {},
      });
    }
  });

  return signals;
}

function generateRouteId(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  timestamp: number
): string {
  return `route_${origin.lat.toFixed(3)}_${origin.lng.toFixed(3)}_${destination.lat.toFixed(3)}_${destination.lng.toFixed(3)}_${timestamp}`;
}