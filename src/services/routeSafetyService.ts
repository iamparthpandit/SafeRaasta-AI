import { routePipeline } from '../agents/routePipeline';
import { routeDecisionAgent } from '../agents/routeDecisionAgent';

/**
 * Input/Output types (lightweight)
 */
export interface GoogleRoute {
  index: number;
  coords: Array<{ latitude: number; longitude: number }>;
  polyline?: string;
  distance: number;
  duration: number;
  summary?: string;
}

export interface AnalyzeRoutesInput {
  routes: GoogleRoute[];
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  travelTime: 'day' | 'night';
  city: string;
}

export async function analyzeRoutes(input: AnalyzeRoutesInput) {
  const { routes, origin, destination, travelTime, city } = input;

  // Run pipeline for each route in parallel
  const analyzedPromises = routes.map((r) =>
    routePipeline({ route: r, origin, destination, travelTime, city })
  );

  const analyzed = await Promise.all(analyzedPromises);

  // Call decision agent to select the safest route index
  const decision = await routeDecisionAgent(
    analyzed.map(a => ({
      routeId: a.routeId,
      distance: a.distance,
      duration: a.duration,
      safetyScore: a.safetyScore,
      safetyCategory: a.safetyCategory,
      explanation: a.explanation,
      originalRouteIndex: a.originalRouteIndex,
    }))
  );

  const safestIndex = decision.selectedRouteIndex;

  // Enrich original routes with safety data
  const enrichedRoutes = routes.map((r) => {
    const match = analyzed.find(a => a.originalRouteIndex === r.index);
    return {
      ...r,
      safetyScore: match ? match.safetyScore : null,
      safetyCategory: match ? match.safetyCategory : null,
      explanation: match ? match.explanation : [],
    };
  });

  return {
    routes: enrichedRoutes,
    safestRouteIndex: safestIndex,
  };
}

export default {
  analyzeRoutes,
};