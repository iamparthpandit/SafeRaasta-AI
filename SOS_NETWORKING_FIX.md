# SafeRaasta SOS Feature - Networking Fix Complete

## ✅ Changes Made

### 1. Backend URL Configuration (MapScreen.js Lines 31-37)

```javascript
const DEBUG_SOS = true;

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000' // Emulator: use 10.0.2.2 for localhost
    : 'http://192.168.1.5:3000'; // Physical device: replace with your computer's IP
```

**For different scenarios:**
- **Android Emulator**: Uses `10.0.2.2:3000` (Android emulator's way of accessing host localhost)
- **Physical Android Phone on WiFi**: Replace `192.168.1.5` with your computer's IP address
  - Find your IP: `ipconfig | findstr "IPv4"`
- **Physical Device via ngrok**: Use `https://your-ngrok-url.ngrok.io/api/sos-trigger`

### 2. Improved handleSOS() Function (Lines 393-521)

**What's New:**

✅ **Proper Debug Logging**
```javascript
if (DEBUG_SOS) console.log('SOS Backend URL:', `${BASE_URL}/api/sos-trigger`);
if (DEBUG_SOS) console.log('SOS Payload:', JSON.stringify(payload, null, 2));
if (DEBUG_SOS) console.log('SOS Response Status:', response.status);
```

✅ **8-Second Timeout Protection**
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000);
// ... fetch with signal: controller.signal
clearTimeout(timeoutId);
```

✅ **NO Native Dialer Fallback**
- Completely removed `Linking.openURL('tel:...')`
- No automatic phone app opening
- Only Retell AI call method

✅ **Better Error Messages**
```
- Timeout: "Backend timeout (8s). Check your internet connection."
- Network: "Network error. Check that backend is running..."
- Other: Specific error from backend
```

### 3. AndroidManifest.xml - Already Configured ✓

```xml
<application
  ...
  android:usesCleartextTraffic="true"
  ...
>
```

This allows HTTP calls (not just HTTPS) - required for `http://10.0.2.2:3000`

## 🚀 How to Test

### Step 1: Start Backend
```powershell
cd C:\Projects\SafeRaasta\backend
npm start
# Should show:
# SafeRaasta SOS Backend running on port 3000
# Retell API Key configured: Yes
```

### Step 2: Update Frontend URL (if using physical device on WiFi)

If testing on a physical phone connected to WiFi:

Open [src/screens/MapScreen.js](src/screens/MapScreen.js#L35) and update:
```javascript
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000' // Keep for emulator
    : 'http://192.168.1.YOUR_IP:3000'; // Replace with your computer's IP
```

Find your IP:
```powershell
ipconfig | findstr "IPv4"
# e.g., 192.168.1.100
```

### Step 3: Build and Run App
```powershell
$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot'
cd C:\Projects\SafeRaasta
npm run android
```

### Step 4: Press SOS and Check Logs

**In Android Studio Logcat or `adb logcat`:**
```
=== SOS TRIGGERED ===
Contact: John Doe +919876543210
Location: {latitude: 12.9716, longitude: 77.5946}
SOS: Getting address from coordinates...
SOS: Address resolved: MG Road, Bangalore
SOS Backend URL: http://10.0.2.2:3000/api/sos-trigger
SOS Payload: {...}
SOS: Calling backend API...
SOS Response Status: 200
SOS Response: {success: true, call_id: "call_abc123"}
✅ SOS Call triggered successfully: call_abc123
```

**Success Alert:**
```
"SOS Sent"
"Emergency call is being placed to your contact by SafeRaasta AI.

Do not hang up."
```

## 🔍 Troubleshooting

### Error: "Network request failed"

**Check these:**
1. Backend running? → `npm start` in backend folder
2. Correct URL? → Verify BASE_URL in MapScreen.js
3. Same WiFi? → Phone and computer on same network
4. Port 3000 open? → `netstat -ano | findstr :3000`
5. Firewall? → May need to allow port 3000

### Error: "Backend timeout (8s)"

**Check these:**
1. Backend responding? → `curl http://localhost:3000/api/health`
2. Internet speed? → Slow connection = timeout
3. Retell API down? → Check https://status.retellai.com

### Error: "Could not trigger SOS call"

**Check these:**
1. Emergency contacts added? → Need at least one contact
2. Location enabled? → App needs permission
3. Backend logs? → Check `npm start` terminal for errors
4. Retell credentials? → Verify `.env` file in backend

## 📊 Flow Diagram

```
User taps SOS
    ↓
handleSOS() validation (contacts, location)
    ↓
Get human-readable address (reverse geocode)
    ↓
Prepare payload {name, address, timestamp, phone}
    ↓
POST http://10.0.2.2:3000/api/sos-trigger (8s timeout)
    ↓
Backend calls Retell API
    ↓
Retell makes outbound call to emergency contact
    ↓
AI speaks in Hindi + English (with user name, address, time)
    ↓
Success Alert: "Emergency call is being placed..."
```

## 🎯 Key Differences from Before

| Before | After |
|--------|-------|
| `http://localhost:3000` (won't work on emulator) | `http://10.0.2.2:3000` (works on emulator) |
| Auto opens phone dialer on failure | Only shows error alert |
| Minimal error info | Detailed error messages |
| No timeout handling | 8-second timeout protection |
| Minimal logging | Full DEBUG_SOS logging |

## ⚙️ Configuration Options

**To disable debug logging:**
```javascript
const DEBUG_SOS = false; // Line 31
```

**To change timeout (milliseconds):**
```javascript
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds
```

**To change backend URL:**
```javascript
const BASE_URL = 'https://your-production-backend.com';
```

## 🔐 Security Note

- Never commit hardcoded IP addresses to Git
- Use environment variables for production
- Keep Retell API keys in `.env` (not `.env.example`)
- Use HTTPS for production deployments

## ✨ Next Steps

1. ✅ Backend running on port 3000
2. ✅ Frontend updated with proper URL handling
3. ⏭️ Test SOS on Android emulator
4. ⏭️ Test SOS on physical device
5. ⏭️ Configure Retell agent with Hindi/English script
6. ⏭️ Deploy backend to production server
7. ⏭️ Update production URLs in app

---

**Questions?** Check logs with `DEBUG_SOS = true` enabled for full debugging info.
