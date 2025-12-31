// routeDecisionAgent.ts
// SafeRaasta - Agent-4: Route Decision & Orchestration Agent
// Purpose: Compare multiple analyzed routes and select the safest viable option

import { RouteAnalysis, RouteDecision } from '../agents/types';

/**
 * Interface for a single analyzed route passed to Agent-4
 */
export interface AnalyzedRoute {
  routeId: string;
  distance: number; // in meters
  duration: number; // in seconds
  safetyScore: number; // 0-100
  safetyCategory: 'Safe' | 'Moderate' | 'Risky';
  explanation: string[];
  originalRouteIndex: number; // index from Google Directions API
}

/**
 * Interface for the comparison summary of each route
 */
export interface RouteComparison {
  routeId: string;
  distance: number;
  duration: number;
  safetyScore: number;
  safetyCategory: 'Safe' | 'Moderate' | 'Risky';
}

/**
 * Interface for the final decision output from Agent-4
 */
export interface RouteDecisionOutput {
  selectedRouteIndex: number;
  selectedRouteId: string;
  decisionReason: string;
  comparisonSummary: RouteComparison[];
}

/**
 * Calculate percentage difference between two values
 */
const calculatePercentageDiff = (value1: number, value2: number): number => {
  const max = Math.max(value1, value2);
  const min = Math.min(value1, value2);
  return ((max - min) / min) * 100;
};

/**
 * Format distance in human-readable format (km or m)
 */
const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Format duration in human-readable format (hours/minutes)
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Agent-4: Route Decision Agent
 * 
 * This agent orchestrates the final route selection based on safety analysis
 * from previous agents. It does NOT perform any API calls or safety calculations.
 * 
 * Decision Logic:
 * 1. Prioritize "Safe" routes (highest score among Safe)
 * 2. If only "Moderate", choose highest score with time/safety tradeoff explanation
 * 3. If only "Risky", choose least risky with explicit warning
 * 4. Mention significant distance/duration differences (>30%)
 * 
 * @param analyzedRoutes - Array of routes that have been analyzed by Agents 1-3
 * @returns RouteDecisionOutput - The selected route with decision reasoning
 */
export async function routeDecisionAgent(
  analyzedRoutes: AnalyzedRoute[]
): Promise<RouteDecisionOutput> {
  
  // Validate input
  if (!analyzedRoutes || analyzedRoutes.length === 0) {
    throw new Error('routeDecisionAgent: No routes provided for decision analysis');
  }

  // Sort routes by safety score (descending) for easier processing
  const sortedRoutes = [...analyzedRoutes].sort((a, b) => b.safetyScore - a.safetyScore);

  // Categorize routes by safety level
  const safeRoutes = sortedRoutes.filter(r => r.safetyCategory === 'Safe');
  const moderateRoutes = sortedRoutes.filter(r => r.safetyCategory === 'Moderate');
  const riskyRoutes = sortedRoutes.filter(r => r.safetyCategory === 'Risky');

  let selectedRoute: AnalyzedRoute;
  let decisionReason: string;

  // ==========================================
  // DECISION LOGIC IMPLEMENTATION
  // ==========================================

  // CASE 1: At least one "Safe" route exists
  if (safeRoutes.length > 0) {
    selectedRoute = safeRoutes[0]; // Already sorted by highest score
    
    // Build decision reason
    decisionReason = `Recommended the safest route with a safety score of ${selectedRoute.safetyScore}/100. `;
    decisionReason += `This route is categorized as "Safe" and provides the best security for your journey.`;
    
    // Check if there are significant time/distance tradeoffs vs other routes
    const alternativeRoutes = sortedRoutes.filter(r => r.routeId !== selectedRoute.routeId);
    if (alternativeRoutes.length > 0) {
      const shortestAlternative = alternativeRoutes.reduce((prev, curr) => 
        curr.duration < prev.duration ? curr : prev
      );
      
      const durationDiff = calculatePercentageDiff(selectedRoute.duration, shortestAlternative.duration);
      const distanceDiff = calculatePercentageDiff(selectedRoute.distance, shortestAlternative.distance);
      
      if (durationDiff > 30 || distanceDiff > 30) {
        decisionReason += ` Note: This route may take ${formatDuration(selectedRoute.duration)} `;
        decisionReason += `(${formatDistance(selectedRoute.distance)}), which is longer than alternative routes, `;
        decisionReason += `but prioritizes your safety.`;
      }
    }
  }
  
  // CASE 2: Only "Moderate" routes available
  else if (moderateRoutes.length > 0 && riskyRoutes.length === 0) {
    selectedRoute = moderateRoutes[0]; // Highest score among moderate
    
    decisionReason = `Selected the best available route with a safety score of ${selectedRoute.safetyScore}/100. `;
    decisionReason += `All available routes are categorized as "Moderate" risk. `;
    decisionReason += `This route offers the best balance between safety and travel time.`;
    
    // Explain time vs safety tradeoff
    const fastestModerate = moderateRoutes.reduce((prev, curr) => 
      curr.duration < prev.duration ? curr : prev
    );
    
    if (selectedRoute.routeId !== fastestModerate.routeId) {
      const timeDiff = calculatePercentageDiff(selectedRoute.duration, fastestModerate.duration);
      if (timeDiff > 10) {
        decisionReason += ` While a faster route exists (${formatDuration(fastestModerate.duration)}), `;
        decisionReason += `the recommended route (${formatDuration(selectedRoute.duration)}) provides better safety.`;
      }
    }
  }
  
  // CASE 3: Only "Risky" routes available
  else if (riskyRoutes.length > 0) {
    selectedRoute = riskyRoutes[0]; // Least risky (highest score among risky)
    
    decisionReason = `⚠️ WARNING: All available routes have elevated safety concerns. `;
    decisionReason += `We've selected the least risky option with a safety score of ${selectedRoute.safetyScore}/100, `;
    decisionReason += `but we strongly recommend considering alternative travel times, `;
    decisionReason += `routes, or modes of transportation. `;
    decisionReason += `Please exercise extra caution if you proceed with this journey.`;
    
    // Highlight the specific risks
    if (selectedRoute.explanation && selectedRoute.explanation.length > 0) {
      decisionReason += ` Key concerns: ${selectedRoute.explanation.slice(0, 2).join('; ')}.`;
    }
  }
  
  // CASE 4: No valid routes (should not happen, but handle defensively)
  else {
    selectedRoute = sortedRoutes[0];
    decisionReason = `Selected route with safety score ${selectedRoute.safetyScore}/100. `;
    decisionReason += `Unable to determine optimal safety category. Please review route details carefully.`;
  }

  // ==========================================
  // BUILD COMPARISON SUMMARY
  // ==========================================
  
  const comparisonSummary: RouteComparison[] = analyzedRoutes.map(route => ({
    routeId: route.routeId,
    distance: route.distance,
    duration: route.duration,
    safetyScore: route.safetyScore,
    safetyCategory: route.safetyCategory,
  }));

  // ==========================================
  // CONSTRUCT FINAL OUTPUT
  // ==========================================
  
  const output: RouteDecisionOutput = {
    selectedRouteIndex: selectedRoute.originalRouteIndex,
    selectedRouteId: selectedRoute.routeId,
    decisionReason,
    comparisonSummary,
  };

  return output;
}

// ==========================================
// EXAMPLE USAGE (for testing/reference)
// ==========================================

/*
// Example input with 3 analyzed routes
const exampleAnalyzedRoutes: AnalyzedRoute[] = [
  {
    routeId: 'route_001',
    distance: 5200, // 5.2 km
    duration: 900, // 15 minutes
    safetyScore: 85,
    safetyCategory: 'Safe',
    explanation: [
      'Well-lit streets throughout the route',
      'Multiple commercial areas with high foot traffic',
      'Good police presence in the area'
    ],
    originalRouteIndex: 0,
  },
  {
    routeId: 'route_002',
    distance: 4100, // 4.1 km
    duration: 720, // 12 minutes
    safetyScore: 62,
    safetyCategory: 'Moderate',
    explanation: [
      'Route passes through isolated areas after 8 PM',
      'Limited street lighting on connecting roads',
      'Moderate crime reports in the vicinity'
    ],
    originalRouteIndex: 1,
  },
  {
    routeId: 'route_003',
    distance: 3800, // 3.8 km
    duration: 660, // 11 minutes
    safetyScore: 38,
    safetyCategory: 'Risky',
    explanation: [
      'High crime rate area with recent incidents',
      'Poor lighting and deserted streets',
      'Multiple accident-prone intersections',
      'Avoid during night hours'
    ],
    originalRouteIndex: 2,
  },
];

// Usage
async function testRouteDecisionAgent() {
  try {
    const decision = await routeDecisionAgent(exampleAnalyzedRoutes);
    
    console.log('=== ROUTE DECISION OUTPUT ===');
    console.log(`Selected Route: ${decision.selectedRouteId}`);
    console.log(`Selected Index: ${decision.selectedRouteIndex}`);
    console.log(`\nDecision Reason:\n${decision.decisionReason}`);
    console.log('\n=== COMPARISON SUMMARY ===');
    decision.comparisonSummary.forEach((route, idx) => {
      console.log(`\nRoute ${idx + 1}:`);
      console.log(`  ID: ${route.routeId}`);
      console.log(`  Distance: ${route.distance}m`);
      console.log(`  Duration: ${route.duration}s`);
      console.log(`  Safety: ${route.safetyScore}/100 (${route.safetyCategory})`);
    });
  } catch (error) {
    console.error('Error in route decision:', error);
  }
}

// Expected output:
// Selected Route: route_001
// Selected Index: 0
// Decision Reason: "Recommended the safest route with a safety score of 85/100. 
//   This route is categorized as "Safe" and provides the best security for your journey. 
//   Note: This route may take 15m (5.2 km), which is longer than alternative routes, 
//   but prioritizes your safety."
// 
// Comparison Summary shows all 3 routes with their metrics
*/