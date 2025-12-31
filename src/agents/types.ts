// Shared types for SafeRaasta Agentic System

export type SafetyCategory = 'Safe' | 'Moderate' | 'Risky';

export interface RouteAnalysis {
  routeId: string;
  distance: number; // meters
  duration: number; // seconds
  safetyScore: number; // 0–100
  safetyCategory: SafetyCategory;
  explanation: string[];
  originalRouteIndex: number;
}

export interface RouteDecision {
  selectedRouteIndex: number;
  selectedRouteId: string;
  decisionReason: string;
  comparisonSummary: Array<{
    routeId: string;
    distance: number;
    duration: number;
    safetyScore: number;
    safetyCategory: SafetyCategory;
  }>;
}