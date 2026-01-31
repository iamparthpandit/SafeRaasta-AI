# SafeRaasta Backend

Emergency SOS backend service integrated with Retell AI for automated emergency calling.

## Features

- **POST /api/sos** (alias: `/api/sos-trigger`): Triggers emergency call via Retell AI
- **GET /api/health**: Health check endpoint

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Retell API credentials
```

3. Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `RETELL_API_KEY`: Your Retell AI API key
- `RETELL_AGENT_ID`: Your Retell AI agent ID
- `RETELL_FROM_NUMBER`: Verified E.164 outbound number for Retell (e.g., +15055885158)

## API Endpoints

### POST /api/sos (alias: /api/sos-trigger)

Triggers emergency call to specified phone number.

**Request Body:**
```json
{
  "userName": "John Doe",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "123 Main St, Bangalore",
  "timestamp": "1/22/2026, 3:45:12 PM",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS call triggered",
  "call_id": "call_xyz123"
}
```

### GET /api/health

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "message": "SafeRaasta SOS Backend is running"
}
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment.
2. Ensure environment variables are properly configured (`RETELL_API_KEY`, `RETELL_AGENT_ID`).
3. Use HTTPS for secure communication.
4. (Optional) Use a process manager like PM2 if self-hosting.

### Deploy to Render

This repo includes a Render blueprint at `render.yaml`.

1) Push your code to a Git repo Render can access.
2) In Render, **New > Blueprint** and point to the repo. Render will pick up `render.yaml`.
3) Set the following environment variables in the Render dashboard:
  - `RETELL_API_KEY` (Secret)
  - `RETELL_AGENT_ID` (Secret)
  - `NODE_ENV=production`
4) Deploy. Render will run `npm install` and `npm start` in the `backend` folder.
5) Your service will be reachable at `https://<your-service>.onrender.com`; the SOS endpoint is `/api/sos`.

## Testing

Test the SOS endpoint:
```bash
curl -X POST http://localhost:3000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Test User",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "Test Address, Bangalore",
    "timestamp": "1/22/2026, 3:45:12 PM",
    "phone": "+919876543210"
  }'
```

## Logs

The server logs all requests and Retell API interactions. Monitor logs for debugging:
```bash
# If using PM2
pm2 logs

# If running directly
# Logs appear in console
```
