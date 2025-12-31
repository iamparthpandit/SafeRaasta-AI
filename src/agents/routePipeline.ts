import { routeAnalysisAgent } from './routeAnalysisAgent';
import { routeIntelligenceAgent } from './routeIntelligenceAgent';
import { routeSafetyScoringAgent } from './routeSafetyScoringAgent';
import { routeDecisionAgent } from './routeDecisionAgent';

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
 * Simple orchestrator that runs the agents for a single route
 */
export async function routePipeline(input: RouteInputForPipeline): Promise<AnalyzedRouteOutput> {
  // 1) Agent 1 - Route Analysis
  const analysis = await routeAnalysisAgent({
    origin: { lat: input.origin.latitude, lng: input.origin.longitude },
    destination: { lat: input.destination.latitude, lng: input.destination.longitude },
    polyline: input.route.polyline || '',
    distance: input.route.distance,
    duration: input.route.duration,
    travelTime: input.travelTime,
    city: input.city,
  });

  // 2) Agent 2 - Route Intelligence (calls Gemini / may fallback)
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

  // 3) Agent 3 - Safety Scoring
  // Note: routeIntelligenceAgent now returns deterministic flags + explanation
  const scoring = routeSafetyScoringAgent({
    routeId: analysis.routeId,
    city: input.city,
    travelTime: input.travelTime,
    routeSegments: analysis.routeSegments.map(s => ({
      id: s.id,
      segmentType: s.segmentType,
      distance: s.distance,
      estimatedDuration: s.estimatedDuration,
      characteristics: s.characteristics,
    })),
    structuralSignals: analysis.riskSignals,
    intelligenceSummary: {
      crimeMention: intelligence.flags.crimeMention ? 1 : 0,
      accidentMentions: 0,
      lightingIssue: intelligence.flags.lightingIssue,
      womenSafetyConcern: intelligence.flags.womenSafetyConcern,
      policeAdvisory: intelligence.flags.policeAdvisory,
    } as any,
  });

  // Build minimal analyzed route expected by decision agent
  const analyzedRoute = {
    routeId: scoring.routeId,
    distance: input.route.distance,
    duration: input.route.duration,
    safetyScore: scoring.safetyScore,
    safetyCategory: scoring.category,
    explanation: scoring.reasons,
    originalRouteIndex: input.route.index,
  };

  return analyzedRoute;
}
