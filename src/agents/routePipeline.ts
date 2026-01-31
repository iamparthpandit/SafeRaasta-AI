import { routeAnalysisAgent } from './routeAnalysisAgent';
import { routeIntelligenceAgent } from './routeIntelligenceAgent';
import { routeSafetyScoringAgent } from './routeSafetyScoringAgent';

export interface RouteInputForPipeline {
  route: {
    index: number;
    coords: Array<{ latitude: number; longitude: number }>;
    polyline?: string;
    distance: number;
    duration: number;
    summary?: string;
  };
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  travelTime: 'day' | 'night';
  city: string;
}

export interface AnalyzedRouteOutput {
  routeId: string;
  originalRouteIndex: number;
  distance: number;
  duration: number;
  safetyScore: number;
  safetyCategory: 'Safe' | 'Moderate' | 'Risky';
  explanation: string[];
}

/**
 * Orchestrates Agent 1 → Agent 2 → Agent 3
 * Deterministic, stable pipeline
 */
export async function routePipeline(
  input: RouteInputForPipeline
): Promise<AnalyzedRouteOutput> {

  // =====================
  // Agent 1: Structure
  // =====================
  const analysis = await routeAnalysisAgent({
    origin: { lat: input.origin.latitude, lng: input.origin.longitude },
    destination: { lat: input.destination.latitude, lng: input.destination.longitude },
    polyline: input.route.polyline || '',
    distance: input.route.distance,
    duration: input.route.duration,
    travelTime: input.travelTime,
    city: input.city,
  });

  // =====================
  // Agent 2: Intelligence
  // =====================
  const intelligence = await routeIntelligenceAgent({
    city: input.city,
    travelTime: input.travelTime,
    routeSegments: analysis.routeSegments.map(s => ({
      id: s.id,
      segmentType: s.segmentType,
      distance: s.distance,
      characteristics: s.characteristics,
    })),
    riskSignals: analysis.riskSignals.map(s => ({
      signalType: s.signalType,
      severity: s.severity,
    })),
  });

  // =====================
  // Agent 3: Scoring
  // =====================
  const scoring = routeSafetyScoringAgent({
    routeId: analysis.routeId,
    travelTime: input.travelTime,
    routeSegments: analysis.routeSegments.map(s => ({
      id: s.id,
      segmentType: s.segmentType,
      distance: s.distance,
      estimatedDuration: s.estimatedDuration,
      characteristics: s.characteristics,
    })),
    structuralSignals: analysis.riskSignals,
    intelligenceFlags: intelligence.flags, // ✅ CORRECT MAPPING
  });

  // =====================
  // Final Output
  // =====================
  return {
    routeId: scoring.routeId,
    originalRouteIndex: input.route.index,
    distance: input.route.distance,
    duration: input.route.duration,
    safetyScore: scoring.safetyScore,
    safetyCategory: scoring.category,
    explanation: scoring.reasons,
  };
}