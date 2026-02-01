// Google API Keys Configuration
// 
// SECURITY: API keys are loaded from environment variables (.env file)
// The .env file is NOT committed to Git (listed in .gitignore)
// See .env.example for the required variables

import {
  REACT_APP_GOOGLE_API_KEY,
  REACT_APP_GEMINI_API_KEY,
} from '@env';

export const GOOGLE_API_KEY = REACT_APP_GOOGLE_API_KEY || '';
export const GEMINI_API_KEY = REACT_APP_GEMINI_API_KEY || '';

// Development warnings
if (!GEMINI_API_KEY && __DEV__) {
  console.warn('⚠️  GEMINI_API_KEY not found. Check .env file');
}

if (!GOOGLE_API_KEY && __DEV__) {
  console.warn('⚠️  GOOGLE_API_KEY not found. Check .env file');
}
