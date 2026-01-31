import { routePipeline } from '../agents/routePipeline';
import { routeDecisionAgent } from '../agents/routeDecisionAgent';

/**
 * Input/Output types
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

export interface AnalyzedRoute {
  index: number;
  coords: Array<{ latitude: number; longitude: number }>;
  polyline?: string;
  distance: number;
  duration: number;
  summary?: string;
  safetyScore: number;
  safetyCategory: 'Safe' | 'Moderate' | 'Risky';
  explanation: string[];
}

export interface AnalyzeRoutesOutput {
  routes: AnalyzedRoute[];
  safestRouteIndex: number;
}

/**
 * Analyze all Google routes and find the safest one
 */
export async function analyzeRoutes(
  input: AnalyzeRoutesInput
): Promise<AnalyzeRoutesOutput> {
  const { routes, origin, destination, travelTime, city } = input;

  // 1️⃣ Run full agent pipeline for each route
  const analyzedResults = await Promise.all(
    routes.map(route =>
      routePipeline({
        route,
        origin,
        destination,
        travelTime,
        city,
      })
    )
  );

  // 2️⃣ Ask decision agent which route is safest
  const decision = await routeDecisionAgent(
    analyzedResults.map(r => ({
      routeId: r.routeId,
      distance: r.distance,
      duration: r.duration,
      safetyScore: r.safetyScore,
      safetyCategory: r.safetyCategory,
      explanation: r.explanation,
      originalRouteIndex: r.originalRouteIndex,
    }))
  );

  const safestRouteIndex = decision.selectedRouteIndex;

  // 3️⃣ Merge safety data back into Google routes
  const enrichedRoutes: AnalyzedRoute[] = routes.map(route => {
    const analysis = analyzedResults.find(
      a => a.originalRouteIndex === route.index
    );

    return {
      index: route.index,
      coords: route.coords,
      polyline: route.polyline,
      distance: route.distance,
      duration: route.duration,
      summary: route.summary,
      safetyScore: analysis?.safetyScore ?? 0,
      safetyCategory: analysis?.safetyCategory ?? 'Moderate',
      explanation: analysis?.explanation ?? [],
    };
  });

  return {
    routes: enrichedRoutes,
    safestRouteIndex,
  };
}

export default {
  analyzeRoutes,
};