// routePipeline.ts
// Orchestrates all SafeRaasta agentic stages in correct order

import { routeAnalysisAgent } from './routeAnalysisAgent';
import { routeIntelligenceAgent } from './routeIntelligenceAgent';
import { routeSafetyScoringAgent } from './routeSafetyScoringAgent';
import { routeDecisionAgent } from './routeDecisionAgent';

import {
  RouteAnalysis,
  RouteDecision,
  SafetyCategory,
} from './types';

// ===============================
// INPUT / OUTPUT TYPES
// ===============================

export interface RoutePipelineInput {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  polyline: string;
  distance: number; // meters
  duration: number; // seconds
  travelTime: 'day' | 'night';
  city: string;
  originalRouteIndex: number;
}

export interface RoutePipelineOutput {
  analysis: RouteAnalysis;
  decision: RouteDecision;
}

// ===============================
// PIPELINE FUNCTION
// ===============================

export async function routePipeline(
  input: RoutePipelineInput
): Promise<RoutePipelineOutput> {
  console.log('[Pipeline] Starting SafeRaasta route analysis');

  // ===============================
  // STAGE 1: STRUCTURAL ANALYSIS
  // ===============================
  const analysisOutput = await routeAnalysisAgent({
    origin: input.origin,
    destination: input.destination,
    polyline: input.polyline,
    distance: input.distance,
    duration: input.duration,
    travelTime: input.travelTime,
    city: input.city,
  });

  // ===============================
  // STAGE 2: INTELLIGENCE (WEB + DATA)
  // ===============================
  const intelligenceOutput = await routeIntelligenceAgent({
    city: analysisOutput.metadata.city,
    travelTime: analysisOutput.metadata.travelTime,
    routeSegments: analysisOutput.routeSegments.map(seg => ({
      id: seg.id,
      segmentType: seg.segmentType,
      distance: seg.distance,
      characteristics: seg.characteristics,
    })),
    riskSignals: analysisOutput.riskSignals.map(signal => ({
      signalType: signal.signalType,
      severity: signal.severity,
    })),
  });

  // ===============================
  // STAGE 3: SAFETY SCORING
  // ===============================
  const scoringOutput = routeSafetyScoringAgent({
    routeId: analysisOutput.routeId,
    city: analysisOutput.metadata.city,
    travelTime: analysisOutput.metadata.travelTime,
    routeSegments: analysisOutput.routeSegments,
    structuralSignals: analysisOutput.riskSignals,
    intelligenceSummary: {
      crimeMentions: intelligenceOutput.identifiedRiskFactors.filter(f => f.type === 'crime').length,
      accidentMentions: intelligenceOutput.identifiedRiskFactors.filter(f => f.type === 'traffic').length,
      lightingIssues: intelligenceOutput.identifiedRiskFactors.some(f =>
        f.description.toLowerCase().includes('lighting')
      ),
      womenSafetyConcerns: intelligenceOutput.identifiedRiskFactors.some(f =>
        f.description.toLowerCase().includes('women')
      ),
      policeAdvisories: intelligenceOutput.identifiedRiskFactors
        .filter(f => f.description.toLowerCase().includes('advisory'))
        .map(f => f.description),
      sentiment:
        intelligenceOutput.overallContext === 'safe'
          ? 'positive'
          : intelligenceOutput.overallContext === 'caution'
          ? 'negative'
          : 'neutral',
    },
  });

  // ===============================
  // STAGE 4: DECISION MAKING
  // ===============================
  const decisionOutput = await routeDecisionAgent([
    {
      routeId: scoringOutput.routeId,
      distance: input.distance,
      duration: input.duration,
      safetyScore: scoringOutput.safetyScore,
      safetyCategory: scoringOutput.category as SafetyCategory,
      explanation: scoringOutput.reasons,
      originalRouteIndex: input.originalRouteIndex,
    },
  ]);

  // ===============================
  // FINAL OUTPUT
  // ===============================
  const analysis: RouteAnalysis = {
    routeId: scoringOutput.routeId,
    distance: input.distance,
    duration: input.duration,
    safetyScore: scoringOutput.safetyScore,
    safetyCategory: scoringOutput.category as SafetyCategory,
    explanation: scoringOutput.reasons,
    originalRouteIndex: input.originalRouteIndex,
  };

  const decision: RouteDecision = {
    selectedRouteIndex: decisionOutput.selectedRouteIndex,
    selectedRouteId: decisionOutput.selectedRouteId,
    decisionReason: decisionOutput.decisionReason,
    comparisonSummary: decisionOutput.comparisonSummary,
  };

  console.log('[Pipeline] Completed successfully');

  return {
    analysis,
    decision,
  };
}