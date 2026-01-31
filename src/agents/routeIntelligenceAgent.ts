/**
 * Agent 2: Route Intelligence Agent
 * 
 * Purpose: Enrich route analysis with real-world safety intelligence
 * 
 * Multi-Agent System Position:
 * Agent 1 (Route Analysis) → Agent 2 (Intelligence) → Agent 3 (Scoring) → Agent 4 (Recommendations)
 * 
 * This agent:
 * - Takes structured route data from Agent 1
 * - Queries Gemini for public safety intelligence via REST API
 * - Returns ONLY factual, aggregated safety context
 * - Does NOT calculate scores or suggest routes
 * 
 * Data Philosophy:
 * - Use aggregated public data only (NCRB trends, municipal reports, news)
 * - NO raw FIR data, NO personal information, NO fabricated statistics
 * - Explicit about confidence levels
 * - Traceable to source categories
 * 
 * REACT NATIVE COMPATIBILITY:
 * - Uses fetch() instead of @google/generative-ai SDK
 * - REST API calls work across all RN environments
 */

import { GEMINI_API_KEY } from '../config/keys';

// ============================================================================
// CONSTANTS
// ============================================================================

const GEMINI_ENDPOINT = 
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RouteIntelligenceInput {
  city: string;
  travelTime: 'day' | 'night';
  routeSegments: Array<{
    id: string;
    segmentType: 'highway' | 'main_road' | 'residential' | 'unknown';
    distance: number;
    characteristics: string[];
  }>;
  riskSignals: Array<{
    signalType: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface RouteIntelligenceOutput {
  flags: {
    crimeMention: boolean;
    lightingIssue: boolean;
    womenSafetyConcern: boolean;
    policeAdvisory: boolean;
  };
  explanation: string[];
  generatedAt: string;
}

interface GeminiResponseSchema {
  routeSummary: string;
  identifiedRiskFactors: Array<{
    type: 'crime' | 'infrastructure' | 'traffic' | 'environment' | 'social';
    description: string;
    confidence: 'low' | 'medium' | 'high';
    sourceCategory: 'government' | 'news' | 'municipal' | 'crowdsourced';
  }>;
  overallContext: 'safe' | 'moderate' | 'caution';
  sourcesUsed: string[];
}

// ============================================================================
// GEMINI PROMPT TEMPLATE
// ============================================================================

/**
 * This prompt instructs Gemini to act as a safety intelligence analyst
 * - Focus on PUBLIC, AGGREGATED data only
 * - Provide context, not scores
 * - Be explicit about uncertainty
 * - Return strict JSON format
 */
const INTELLIGENCE_PROMPT_TEMPLATE = `You are a safety intelligence analyst for SafeRaasta, a navigation app in India.

Your task: Provide factual, aggregated safety intelligence for a route based on structural analysis.

CRITICAL RULES:
1. Use ONLY publicly available, aggregated data sources:
   - NCRB (National Crime Records Bureau) aggregated city/state trends
   - City police public dashboards and safety advisories
   - Municipal infrastructure reports (street lighting, road conditions)
   - Traffic accident density reports from transport authorities
   - Smart City open datasets
   - Recent news reports on public safety incidents
   
2. NEVER fabricate specific crime numbers or incidents
3. NEVER reference individual FIRs or personal data
4. If uncertain, explicitly state "confidence: low"
5. Focus on CONTEXT, not scores

INPUT DATA:
City: {city}
Travel Time: {travelTime}
Route Segments: {segmentCount} segments
Segment Types: {segmentTypes}
Detected Signals: {riskSignals}

TASK:
Analyze this route and provide intelligence on:
- General safety context for {city} during {travelTime} hours
- Known infrastructure challenges (lighting, road quality)
- Traffic patterns and accident-prone characteristics
- Environmental factors (isolated areas, visibility)
- Recent public safety advisories or news

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "routeSummary": "Brief 2-3 sentence overview of route safety context",
  "identifiedRiskFactors": [
    {
      "type": "crime|infrastructure|traffic|environment|social",
      "description": "Specific factual observation with context",
      "confidence": "low|medium|high",
      "sourceCategory": "government|news|municipal|crowdsourced"
    }
  ],
  "overallContext": "safe|moderate|caution",
  "sourcesUsed": ["List of general source types referenced"]
}

RESPOND WITH ONLY THE JSON OBJECT. NO MARKDOWN. NO EXPLANATIONS.`;

// ============================================================================
// GEMINI REST API FUNCTION
// ============================================================================

/**
 * Call Gemini API using REST endpoint (React Native compatible)
 * 
 * This replaces the @google/generative-ai SDK which doesn't work in RN
 * Uses standard fetch() which works across all platforms
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found in config/keys');
  }

  const url = `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower for factual responses
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const json = await response.json();

    // Validate response structure
    if (!json?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response structure');
    }

    return json.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

// ============================================================================
// CORE AGENT FUNCTION
// ============================================================================

/**
 * Main agent function: Enriches route analysis with safety intelligence
 * 
 * Flow:
 * 1. Receive structured data from Agent 1
 * 2. Format prompt for Gemini with route context
 * 3. Query Gemini via REST API for public safety intelligence
 * 4. Parse and validate response
 * 5. Return structured intelligence for Agent 3 (scoring)
 */
export async function routeIntelligenceAgent(
  input: RouteIntelligenceInput
): Promise<RouteIntelligenceOutput> {
  
  // Validate input
  validateInput(input);
  
  try {
    // Build context-rich prompt
    const prompt = buildPrompt(input);
    
    // Query Gemini via REST API
    const responseText = await callGeminiAPI(prompt);
    
    // Parse and validate response
    const intelligence = parseGeminiResponse(responseText);

    // Map parsed intelligence into flags + short explanation (deterministic mapping)
    const flags = {
      crimeMention: intelligence.identifiedRiskFactors.some((f: any) => f.type === 'crime'),
      lightingIssue: intelligence.identifiedRiskFactors.some((f: any) => f.type === 'infrastructure' && /light/i.test(f.description)),
      womenSafetyConcern: intelligence.identifiedRiskFactors.some((f: any) => /women/i.test(f.description) || f.type === 'social'),
      policeAdvisory: intelligence.identifiedRiskFactors.some((f: any) => f.sourceCategory === 'government' || /police/i.test(f.description)),
    };

    const explanation = intelligence.identifiedRiskFactors.map((f: any) => f.description).slice(0, 6);

    return {
      flags,
      explanation,
      generatedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Route Intelligence Agent Error:', error);

    // Return safe fallback response
    return getFallbackResponse(input);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate input structure from Agent 1
 */
function validateInput(input: RouteIntelligenceInput): void {
  if (!input.city || typeof input.city !== 'string') {
    throw new Error('Invalid input: city is required');
  }
  
  if (!input.travelTime || !['day', 'night'].includes(input.travelTime)) {
    throw new Error('Invalid input: travelTime must be "day" or "night"');
  }
  
  if (!Array.isArray(input.routeSegments) || input.routeSegments.length === 0) {
    throw new Error('Invalid input: routeSegments must be non-empty array');
  }
  
  if (!Array.isArray(input.riskSignals)) {
    throw new Error('Invalid input: riskSignals must be an array');
  }
}

/**
 * Build Gemini prompt with route context
 */
function buildPrompt(input: RouteIntelligenceInput): string {
  // Summarize segment types
  const segmentTypes = input.routeSegments
    .map(s => s.segmentType)
    .reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const segmentTypeSummary = Object.entries(segmentTypes)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');
  
  // Summarize risk signals
  const riskSignalSummary = input.riskSignals
    .map(s => `${s.signalType} (${s.severity})`)
    .join(', ') || 'None detected';
  
  // Replace template variables
  return INTELLIGENCE_PROMPT_TEMPLATE
    .replace('{city}', input.city)
    .replace('{travelTime}', input.travelTime)
    .replace('{segmentCount}', input.routeSegments.length.toString())
    .replace('{segmentTypes}', segmentTypeSummary)
    .replace('{riskSignals}', riskSignalSummary);
}

/**
 * Parse Gemini response with defensive error handling
 * 
 * Gemini may return:
 * - Clean JSON
 * - JSON wrapped in markdown code blocks
 * - Malformed JSON
 * 
 * This function handles all cases safely
 */
function parseGeminiResponse(text: string): GeminiResponseSchema {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    
    // Strip ```json and ``` markers
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON
    const parsed = JSON.parse(cleanText);
    
    // Validate required fields
    if (!parsed.routeSummary || typeof parsed.routeSummary !== 'string') {
      throw new Error('Missing or invalid routeSummary');
    }
    
    if (!Array.isArray(parsed.identifiedRiskFactors)) {
      throw new Error('Missing or invalid identifiedRiskFactors');
    }
    
    if (!['safe', 'moderate', 'caution'].includes(parsed.overallContext)) {
      throw new Error('Invalid overallContext value');
    }
    
    if (!Array.isArray(parsed.sourcesUsed)) {
      throw new Error('Missing or invalid sourcesUsed');
    }
    
    // Validate each risk factor
    parsed.identifiedRiskFactors.forEach((factor: any, index: number) => {
      const validTypes = ['crime', 'infrastructure', 'traffic', 'environment', 'social'];
      const validConfidence = ['low', 'medium', 'high'];
      const validSources = ['government', 'news', 'municipal', 'crowdsourced'];
      
      if (!validTypes.includes(factor.type)) {
        throw new Error(`Invalid type in risk factor ${index}`);
      }
      
      if (!factor.description || typeof factor.description !== 'string') {
        throw new Error(`Invalid description in risk factor ${index}`);
      }
      
      if (!validConfidence.includes(factor.confidence)) {
        throw new Error(`Invalid confidence in risk factor ${index}`);
      }
      
      if (!validSources.includes(factor.sourceCategory)) {
        throw new Error(`Invalid sourceCategory in risk factor ${index}`);
      }
    });
    
    return parsed as GeminiResponseSchema;
    
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    console.error('Raw response:', text);
    throw new Error(`Invalid JSON response from Gemini: ${error}`);
  }
}

/**
 * Generate safe fallback response if Gemini fails
 * 
 * This ensures the system degrades gracefully
 * Returns minimal, conservative intelligence
 */
function getFallbackResponse(input: RouteIntelligenceInput): RouteIntelligenceOutput {
  const hasNightSignal = input.riskSignals.some(s => s.signalType === 'night_travel');
  const hasHighwaySegments = input.routeSegments.some(s => s.segmentType === 'highway');

  const identified: Array<{ description: string; type: string; sourceCategory: string } > = [
    {
      type: 'infrastructure',
      description: 'Unable to fetch real-time safety intelligence. Route analysis based on structural data only.',
      sourceCategory: 'municipal',
    },
    ...(hasNightSignal ? [{
      type: 'environment',
      description: 'Night travel may reduce visibility and increase isolation on some segments.',
      sourceCategory: 'municipal',
    }] : []),
    ...(hasHighwaySegments ? [{
      type: 'traffic',
      description: 'Route includes highway segments with higher speed limits.',
      sourceCategory: 'municipal',
    }] : []),
  ];

  // Translate to flags and simple explanations
  const flags = {
    crimeMention: false,
    lightingIssue: hasNightSignal ? true : false,
    womenSafetyConcern: false,
    policeAdvisory: false,
  };

  const explanation = identified.map(i => i.description).slice(0, 6);

  return {
    flags,
    explanation,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const _internal = {
  buildPrompt,
  parseGeminiResponse,
  validateInput,
  getFallbackResponse,
  callGeminiAPI,
};