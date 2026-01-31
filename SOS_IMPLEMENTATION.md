# SafeRaasta SOS Implementation - Retell AI Integration

## Overview

This implementation adds real-time emergency calling via Retell AI to the SafeRaasta app. When a user taps SOS, the backend triggers an automated AI voice call to their emergency contact in Hindi + English.

## What Was Implemented

### Backend (New)
- **Backend folder structure** created with Express.js server
- **Retell AI integration** for automated emergency calls
- **SOS trigger endpoint** (`POST /api/sos-trigger`)
- **Environment configuration** with API keys
- **Comprehensive logging** for debugging

### Frontend (Modified)
- **Updated handleSOS()** in MapScreen.js to call backend API
- **Added reverse geocoding** to get human-readable addresses
- **Maintained fallback** to direct phone call if API fails
- **No UI changes** - kept existing SOS button and behavior

## File Structure

```
SafeRaasta/
├── backend/
│   ├── controllers/
│   │   └── sosController.js      # Retell AI integration logic
│   ├── .env                       # Environment variables (configured)
│   ├── .env.example              # Environment template
│   ├── .gitignore                # Git ignore for backend
│   ├── package.json              # Backend dependencies
│   ├── README.md                 # Backend documentation
│   ├── routes.js                 # API routes
│   └── server.js                 # Express server entry point
├── src/
│   └── screens/
│       └── MapScreen.js          # Updated handleSOS() function
└── SOS_IMPLEMENTATION.md         # This file
```

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Verify .env file has correct credentials
# RETELL_API_KEY and RETELL_AGENT_ID are already configured
cat .env

# Start backend server
npm run dev
```

The server will start on `http://localhost:3000`

### 2. Deploy Backend (Production)

For production, you need to deploy the backend to a server with a public URL:

**Option A: Using a VPS (DigitalOcean, AWS, etc.)**
```bash
# Copy backend folder to server
scp -r backend/ user@your-server:/path/to/backend

# SSH into server
ssh user@your-server

# Navigate to backend
cd /path/to/backend

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name saferaasta-backend

# Save PM2 config
pm2 save
pm2 startup
```

**Option B: Using ngrok (for testing)**
```bash
# In backend folder, start server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

### 3. Update Frontend with Backend URL

Open [src/screens/MapScreen.js](src/screens/MapScreen.js#L424) and update the backend URL:

```javascript
// Line ~424 in handleSOS()
const backendUrl = 'http://localhost:3000/api/sos-trigger';  // For local testing

// Change to your production URL:
const backendUrl = 'https://your-backend-url.com/api/sos-trigger';
```

### 4. Test the Implementation

**Backend Health Check:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","message":"SafeRaasta SOS Backend is running"}
```

**Test SOS Endpoint:**
```bash
curl -X POST http://localhost:3000/api/sos-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Test User",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "Bangalore, Karnataka, India",
    "timestamp": "1/22/2026, 3:45:12 PM",
    "phone": "+919876543210"
  }'
```

**Test from App:**
1. Open SafeRaasta app
2. Make sure you have emergency contacts configured
3. Tap the SOS button
4. Check backend logs to see the API call
5. Verify Retell AI call was triggered

## How It Works

### Flow Diagram
```
User taps SOS Button
    ↓
handleSOS() validates contacts & location
    ↓
Reverse geocode coordinates → human-readable address
    ↓
Send POST to backend /api/sos-trigger with:
  - userName
  - latitude, longitude
  - address
  - timestamp
  - emergency contact phone
    ↓
Backend calls Retell AI API
    ↓
Retell AI makes automated call to emergency contact
    ↓
AI speaks in Hindi + English:
  - User name
  - Location address
  - Time of emergency
  - Mention that GPS link was sent via SMS
```

### Data Flow

**Frontend Payload:**
```json
{
  "userName": "John Doe",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "MG Road, Bangalore, Karnataka, India",
  "timestamp": "1/22/2026, 3:45:12 PM",
  "phone": "+919876543210"
}
```

**Retell AI Call Variables:**
```json
{
  "agent_id": "agent_0a3684b465ac149dd6d1f282a1",
  "to_number": "+919876543210",
  "variables": {
    "name": "John Doe",
    "address": "MG Road, Bangalore, Karnataka, India",
    "time": "1/22/2026, 3:45:12 PM"
  }
}
```

**Backend Response:**
```json
{
  "success": true,
  "message": "SOS call triggered",
  "call_id": "call_abc123xyz"
}
```

## Configuration

### Environment Variables

Located in `backend/.env`:
```bash
PORT=3000
NODE_ENV=development
RETELL_API_KEY=key_6cccef41b9b5a51c325ace1556c1
RETELL_AGENT_ID=agent_0a3684b465ac149dd6d1f282a1
```

### Retell Agent Configuration

Your Retell AI agent should be configured with:
- **Variables**: `name`, `address`, `time`
- **Language**: Hindi + English
- **Script**: Emergency alert mentioning user name, location, and that GPS link is sent

Example agent script:
```
नमस्ते! यह SafeRaasta से एक आपातकालीन अलर्ट है।
Hello! This is an emergency alert from SafeRaasta.

{{name}} को तुरंत मदद की आवश्यकता है।
{{name}} needs immediate help.

स्थान: {{address}}
Location: {{address}}

समय: {{time}}
Time: {{time}}

उनका GPS स्थान आपके SMS में भेजा गया है। कृपया तुरंत जाएं।
Their GPS location has been sent to you via SMS. Please go immediately.
```

## Troubleshooting

### Backend not starting
```bash
# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Kill the process using port 3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Frontend can't connect to backend
- **Local testing**: Make sure backend is running on `http://localhost:3000`
- **Android emulator**: Use `http://10.0.2.2:3000` instead of localhost
- **Physical device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)
- **Production**: Use HTTPS URL from your deployed backend

### Retell API errors
- Verify API key is correct in `.env`
- Check agent ID is valid
- Ensure phone number is in E.164 format (+[country code][number])
- Check Retell API logs at https://retellai.com

### Address not resolving
- Verify Google Maps API key is valid
- Ensure billing is enabled for Google Maps Geocoding API
- Check network connectivity

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Health check endpoint responds
- [ ] Emergency contacts are loaded in app
- [ ] Location permission is granted
- [ ] SOS button triggers handleSOS()
- [ ] Address is reverse geocoded successfully
- [ ] Backend receives SOS payload
- [ ] Retell API returns success
- [ ] Emergency contact receives AI call
- [ ] Fallback call works if API fails
- [ ] Logs show complete flow

## Security Considerations

1. **API Keys**: Never commit `.env` to git (already in `.gitignore`)
2. **HTTPS**: Use HTTPS for production backend
3. **Authentication**: Consider adding API key authentication for production
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Validation**: Phone numbers and data are validated

## Next Steps

1. **Deploy backend to production server**
2. **Update frontend with production URL**
3. **Configure Retell agent script in Hindi + English**
4. **Test with real phone numbers**
5. **Monitor logs for issues**
6. **Add SMS fallback if Retell fails** (optional)
7. **Add WhatsApp integration** (future enhancement)

## Support

For issues or questions:
1. Check backend logs: `pm2 logs saferaasta-backend`
2. Check frontend logs in React Native debugger
3. Check Retell API dashboard for call history
4. Review this implementation guide

## Credits

- **Retell AI**: https://retellai.com
- **Google Maps API**: Geocoding and location services
- **Express.js**: Backend framework
