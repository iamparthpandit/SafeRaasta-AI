/**
 * Agent 3: Route Safety Scoring & Explanation Agent
 * 
 * Purpose: Calculate deterministic, explainable safety scores
 * 
 * Multi-Agent System Position:
 * Agent 1 (Route Analysis) → Agent 2 (Intelligence) → Agent 3 (Scoring) → Agent 4 (Recommendations)
 * 
 * This agent:
 * - Takes structured data from Agent 1 (route structure) and Agent 2 (intelligence)
 * - Applies rule-based weighted scoring
 * - Produces explainable, deterministic results
 * - Does NOT call external APIs
 * - Does NOT use randomness
 * - Does NOT suggest specific alternative routes
 * 
 * Scoring Philosophy:
 * - Start at 100 (perfect score)
 * - Apply penalties based on risk factors
 * - All penalties are transparent and explainable
 * - Results are suitable for legal/judicial review
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Route segment from Agent 1
 */
export interface RouteSegment {
  id: string;
  segmentType: 'highway' | 'main_road' | 'residential' | 'unknown';
  distance: number;
  estimatedDuration: number;
  characteristics: string[];
}

/**
 * Risk signal from Agent 1
 */
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
  affectedSegments: string[];
  metadata: Record<string, any>;
}

/**
 * Intelligence summary from Agent 2
 */
export interface IntelligenceSummary {
  crimeMentions: number;
  accidentMentions: number;
  lightingIssues: boolean;
  womenSafetyConcerns: boolean;
  policeAdvisories: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Complete input to Agent 3
 */
export interface SafetyScoringInput {
  routeId: string;
  city: string;
  travelTime: 'day' | 'night';
  routeSegments: RouteSegment[];
  structuralSignals: RiskSignal[];
  intelligenceSummary: IntelligenceSummary;
}

/**
 * Output from Agent 3
 */
export interface SafetyScoringOutput {
  routeId: string;
  safetyScore: number;
  category: 'Safe' | 'Moderate' | 'Risky';
  reasons: string[];
  recommendation: {
    searchAlternative: boolean;
    reason: string;
  };
  metadata: {
    scoringTimestamp: string;
    totalPenalties: number;
    penaltyBreakdown: Record<string, number>;
  };
}

// ============================================================================
// SCORING CONSTANTS
// ============================================================================

/**
 * Base safety score (perfect route)
 */
const BASE_SCORE = 100;

/**
 * Penalty weights for each risk factor
 * All penalties are negative values
 */
const PENALTIES = {
  NIGHT_TRAVEL: -10,
  CRIME_MENTION: -5,
  ACCIDENT_MENTION: -3,
  POOR_LIGHTING: -10,
  WOMEN_SAFETY_CONCERNS: -15,
  ISOLATED_SEGMENT: -8,
  HIGH_SPEED_SEGMENT: -4,
  NEGATIVE_SENTIMENT: -10,
  NEUTRAL_SENTIMENT: -5,
  POLICE_ADVISORY: -7,
  COMPLEX_INTERSECTION: -2,
  LOW_VISIBILITY: -6,
} as const;

/**
 * Score thresholds for categories
 */
const SCORE_THRESHOLDS = {
  SAFE: 80,
  MODERATE: 50,
} as const;

// ============================================================================
// CORE AGENT FUNCTION
// ============================================================================

/**
 * Main scoring agent function
 * 
 * Takes structured data from Agent 1 and Agent 2
 * Returns deterministic, explainable safety score
 * 
 * @param input - Combined data from Agent 1 and Agent 2
 * @returns Safety score, category, reasons, and recommendations
 */
export function routeSafetyScoringAgent(
  input: SafetyScoringInput
): SafetyScoringOutput {
  // Validate input
  validateInput(input);

  // Implement deterministic rule-based scoring (no AI-text affects numeric score)
  let score = 100;

  // Time-based
  if (input.travelTime === 'night') score -= 20;

  // Structural risks - count occurrences in structuralSignals
  const isolatedSegments = input.structuralSignals.filter(s => s.signalType === 'isolated_segment').length;
  const highSpeedSegments = input.structuralSignals.filter(s => s.signalType === 'high_speed_area').length;
  const complexIntersections = input.structuralSignals.filter(s => s.signalType === 'complex_intersection').length;

  if (isolatedSegments > 0) score -= 15;
  if (highSpeedSegments > 0) score -= 10;
  if (complexIntersections > 3) score -= 10;

  // Intelligence flags (boolean only) - derive from intelligenceSummary fields if present
  const flags = {
    crimeMention: !!(input.intelligenceSummary && (input.intelligenceSummary as any).crimeMention),
    lightingIssue: !!(input.intelligenceSummary && (input.intelligenceSummary as any).lightingIssue),
    womenSafetyConcern: !!(input.intelligenceSummary && (input.intelligenceSummary as any).womenSafetyConcern),
    policeAdvisory: !!(input.intelligenceSummary && (input.intelligenceSummary as any).policeAdvisory),
  };

  if (flags.crimeMention) score -= 25;
  if (flags.lightingIssue) score -= 10;
  if (flags.womenSafetyConcern) score -= 15;
  if (flags.policeAdvisory) score -= 20;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Category mapping (fixed)
  let category: 'Safe' | 'Moderate' | 'Risky';
  if (score <= 30) category = 'Risky';
  else if (score <= 70) category = 'Moderate';
  else category = 'Safe';

  // Build human-readable reasons (not used in score)
  const reasons: string[] = [];
  if (input.travelTime === 'night') reasons.push('Night travel increases exposure');
  if (isolatedSegments > 0) reasons.push('Isolated segments detected');
  if (highSpeedSegments > 0) reasons.push('High-speed segments detected');
  if (complexIntersections > 3) reasons.push('Complex intersections along route');
  if (flags.crimeMention) reasons.push('Crime mentions in area');
  if (flags.lightingIssue) reasons.push('Lighting issues reported');
  if (flags.womenSafetyConcern) reasons.push('Women safety concerns reported');
  if (flags.policeAdvisory) reasons.push('Police advisory present');

  const recommendation = generateRecommendation(category, score, input.travelTime, reasons);

  return {
    routeId: input.routeId,
    safetyScore: Math.round(score),
    category,
    reasons,
    recommendation,
    metadata: {
      scoringTimestamp: new Date().toISOString(),
      totalPenalties: 100 - Math.round(score),
      penaltyBreakdown: {},
    },
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate input structure
 */
function validateInput(input: SafetyScoringInput): void {
  if (!input.routeId || typeof input.routeId !== 'string') {
    throw new Error('Invalid input: routeId is required');
  }
  
  if (!input.city || typeof input.city !== 'string') {
    throw new Error('Invalid input: city is required');
  }
  
  if (!['day', 'night'].includes(input.travelTime)) {
    throw new Error('Invalid input: travelTime must be "day" or "night"');
  }
  
  if (!Array.isArray(input.routeSegments)) {
    throw new Error('Invalid input: routeSegments must be an array');
  }
  
  if (!Array.isArray(input.structuralSignals)) {
    throw new Error('Invalid input: structuralSignals must be an array');
  }
  
  if (!input.intelligenceSummary || typeof input.intelligenceSummary !== 'object') {
    throw new Error('Invalid input: intelligenceSummary is required');
  }
}

// ============================================================================
// PENALTY APPLICATION FUNCTIONS
// ============================================================================

/**
 * Apply night travel penalty
 * Night travel inherently increases risk due to reduced visibility and lower population density
 */
function applyNightTravelPenalty(
  score: number,
  travelTime: 'day' | 'night',
  reasons: string[],
  breakdown: Record<string, number>
): number {
  if (travelTime === 'night') {
    const penalty = PENALTIES.NIGHT_TRAVEL;
    breakdown['night_travel'] = penalty;
    reasons.push(`Night travel reduces visibility and increases isolation (${penalty} points)`);
    return score + penalty;
  }
  return score;
}

/**
 * Apply penalties from Agent 2 intelligence
 * These are based on real-world safety data aggregated by Agent 2
 */
function applyIntelligencePenalties(
  score: number,
  intelligence: IntelligenceSummary,
  reasons: string[],
  breakdown: Record<string, number>
): number {
  let currentScore = score;
  
  // Crime mentions
  if (intelligence.crimeMentions > 0) {
    const penalty = PENALTIES.CRIME_MENTION * intelligence.crimeMentions;
    breakdown['crime_mentions'] = penalty;
    reasons.push(
      `${intelligence.crimeMentions} crime-related incident(s) reported in area (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  // Accident mentions
  if (intelligence.accidentMentions > 0) {
    const penalty = PENALTIES.ACCIDENT_MENTION * intelligence.accidentMentions;
    breakdown['accident_mentions'] = penalty;
    reasons.push(
      `${intelligence.accidentMentions} traffic accident(s) reported in area (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  // Lighting issues
  if (intelligence.lightingIssues) {
    const penalty = PENALTIES.POOR_LIGHTING;
    breakdown['poor_lighting'] = penalty;
    reasons.push(`Poor street lighting reported along route (${penalty} points)`);
    currentScore += penalty;
  }
  
  // Women safety concerns
  if (intelligence.womenSafetyConcerns) {
    const penalty = PENALTIES.WOMEN_SAFETY_CONCERNS;
    breakdown['women_safety_concerns'] = penalty;
    reasons.push(`Specific women safety concerns identified in area (${penalty} points)`);
    currentScore += penalty;
  }
  
  // Police advisories
  if (intelligence.policeAdvisories.length > 0) {
    const penalty = PENALTIES.POLICE_ADVISORY * intelligence.policeAdvisories.length;
    breakdown['police_advisories'] = penalty;
    reasons.push(
      `${intelligence.policeAdvisories.length} active police advisory/advisories for area (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  // Sentiment analysis
  if (intelligence.sentiment === 'negative') {
    const penalty = PENALTIES.NEGATIVE_SENTIMENT;
    breakdown['negative_sentiment'] = penalty;
    reasons.push(`Negative safety sentiment in recent reports (${penalty} points)`);
    currentScore += penalty;
  } else if (intelligence.sentiment === 'neutral') {
    const penalty = PENALTIES.NEUTRAL_SENTIMENT;
    breakdown['neutral_sentiment'] = penalty;
    reasons.push(`Mixed safety indicators in recent reports (${penalty} points)`);
    currentScore += penalty;
  }
  
  return currentScore;
}

/**
 * Apply penalties from Agent 1 structural signals
 * These are route-structure based risks detected by polyline analysis
 */
function applyStructuralSignalPenalties(
  score: number,
  signals: RiskSignal[],
  reasons: string[],
  breakdown: Record<string, number>
): number {
  let currentScore = score;
  
  // Count isolated segments
  const isolatedSegments = signals.filter(s => s.signalType === 'isolated_segment');
  if (isolatedSegments.length > 0) {
    const penalty = PENALTIES.ISOLATED_SEGMENT * isolatedSegments.length;
    breakdown['isolated_segments'] = penalty;
    reasons.push(
      `${isolatedSegments.length} isolated highway segment(s) with limited exits (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  // Count high-speed areas
  const highSpeedAreas = signals.filter(s => s.signalType === 'high_speed_area');
  if (highSpeedAreas.length > 0) {
    const penalty = PENALTIES.HIGH_SPEED_SEGMENT * highSpeedAreas.length;
    breakdown['high_speed_segments'] = penalty;
    reasons.push(
      `${highSpeedAreas.length} high-speed segment(s) increasing accident risk (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  // Count complex intersections
  const complexIntersections = signals.filter(s => s.signalType === 'complex_intersection');
  if (complexIntersections.length > 0) {
    const penalty = PENALTIES.COMPLEX_INTERSECTION * complexIntersections.length;
    breakdown['complex_intersections'] = penalty;
    reasons.push(
      `${complexIntersections.length} complex intersection(s) with multiple turns (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  // Count low visibility zones
  const lowVisibilityZones = signals.filter(s => s.signalType === 'low_visibility_zone');
  if (lowVisibilityZones.length > 0) {
    const penalty = PENALTIES.LOW_VISIBILITY * lowVisibilityZones.length;
    breakdown['low_visibility_zones'] = penalty;
    reasons.push(
      `${lowVisibilityZones.length} low visibility zone(s) detected (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  return currentScore;
}

/**
 * Apply penalties based on segment characteristics
 * Additional penalties for specific segment features
 */
function applySegmentPenalties(
  score: number,
  segments: RouteSegment[],
  signals: RiskSignal[],
  reasons: string[],
  breakdown: Record<string, number>
): number {
  let currentScore = score;
  
  // Check for very long segments (>5km) which may indicate isolation
  const longSegments = segments.filter(s => s.distance > 5000);
  if (longSegments.length > 0 && !breakdown['isolated_segments']) {
    // Only apply if not already penalized for isolated segments
    const penalty = -5 * longSegments.length;
    breakdown['long_segments'] = penalty;
    reasons.push(
      `${longSegments.length} very long segment(s) (>5km) detected (${penalty} points)`
    );
    currentScore += penalty;
  }
  
  return currentScore;
}

// ============================================================================
// SCORING HELPERS
// ============================================================================

/**
 * Clamp score to valid range [0, 100]
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determine safety category based on score
 */
function determineCategory(score: number): 'Safe' | 'Moderate' | 'Risky' {
  if (score >= SCORE_THRESHOLDS.SAFE) {
    return 'Safe';
  } else if (score >= SCORE_THRESHOLDS.MODERATE) {
    return 'Moderate';
  } else {
    return 'Risky';
  }
}

/**
 * Generate recommendation based on category and context
 */
function generateRecommendation(
  category: 'Safe' | 'Moderate' | 'Risky',
  score: number,
  travelTime: 'day' | 'night',
  reasons: string[]
): { searchAlternative: boolean; reason: string } {
  
  if (category === 'Safe') {
    return {
      searchAlternative: false,
      reason: `This route has a strong safety profile (score: ${score}/100). No alternative search needed.`,
    };
  }
  
  if (category === 'Moderate') {
    const timeContext = travelTime === 'night' ? 
      ' Consider traveling during daytime if possible.' : '';
    return {
      searchAlternative: true,
      reason: `This route has moderate safety concerns (score: ${score}/100). We recommend exploring alternative routes.${timeContext}`,
    };
  }
  
  // Risky category
  const criticalFactors = reasons.filter(r => 
    r.includes('crime') || 
    r.includes('women safety') || 
    r.includes('police advisory')
  );
  
  const urgency = criticalFactors.length > 0 ? 
    ' Critical safety factors identified.' : '';
  
  return {
    searchAlternative: true,
    reason: `This route has significant safety concerns (score: ${score}/100).${urgency} Strongly recommend finding a safer alternative route.`,
  };
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const _internal = {
  PENALTIES,
  SCORE_THRESHOLDS,
  applyNightTravelPenalty,
  applyIntelligencePenalties,
  applyStructuralSignalPenalties,
  applySegmentPenalties,
  clampScore,
  determineCategory,
  generateRecommendation,
  validateInput,
};