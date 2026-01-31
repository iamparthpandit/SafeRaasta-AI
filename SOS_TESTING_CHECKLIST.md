# SOS Implementation - Quick Checklist

## ✅ Pre-Test Checklist

### Backend Setup
- [ ] Backend running: `npm start` in `backend/` folder
- [ ] Backend listening on port 3000
- [ ] `.env` file has RETELL_API_KEY and RETELL_AGENT_ID
- [ ] Test endpoint: `curl http://localhost:3000/api/health` returns `{status: "ok"}`

### Frontend Setup
- [ ] MapScreen.js updated with BASE_URL configuration (lines 31-37)
- [ ] DEBUG_SOS set to `true` for logging (line 31)
- [ ] No syntax errors in handleSOS() function

### Android Setup
- [ ] JAVA_HOME set: `$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot'`
- [ ] AndroidManifest.xml has `android:usesCleartextTraffic="true"` ✓

### Device Setup (choose one)
- [ ] **Emulator**: Backend URL is `http://10.0.2.2:3000`
- [ ] **Physical Device**: 
  - [ ] Connected to same WiFi as computer
  - [ ] Computer IP found with `ipconfig`
  - [ ] Backend URL updated to `http://[YOUR_IP]:3000`

### App Setup
- [ ] App built and running with Metro bundler
- [ ] User logged in
- [ ] Emergency contact added in profile
- [ ] Location permission granted
- [ ] Current location available on map

## 🧪 Testing Flow

1. **Open App**
   - Navigate to MapScreen
   - Verify location is available (blue dot on map)

2. **Tap SOS Button**
   - Should NOT open phone dialer
   - Should show loading/processing

3. **Check Logs**
   - Android Studio → Logcat
   - Filter: `SOS`
   - Should see:
     - ✓ `=== SOS TRIGGERED ===`
     - ✓ `SOS Backend URL: http://10.0.2.2:3000/api/sos-trigger`
     - ✓ `SOS Response Status: 200`
     - ✓ `✅ SOS Call triggered successfully`

4. **Verify Backend**
   - Check backend terminal for logs
   - Should see POST request logged
   - Retell API call should be logged

5. **Success State**
   - Alert shows: "Emergency call is being placed to your contact by SafeRaasta AI."
   - No phone dialer opened
   - App remains in foreground

## 🐛 If SOS Fails

### Scenario: "Network request failed"

1. **Verify backend running:**
   ```powershell
   curl http://localhost:3000/api/health
   ```
   Should respond with: `{status:"ok",...}`

2. **Check BASE_URL in MapScreen.js:**
   ```javascript
   console.log(BASE_URL); // Should print correct URL
   ```

3. **Verify network connectivity:**
   ```powershell
   ping google.com
   ```

4. **Check firewall:**
   - Windows Defender Firewall may block port 3000
   - Allow port 3000 for Node.js

### Scenario: "Backend timeout (8s)"

1. **Backend is slow:**
   - Retell API response time > 8s
   - Increase timeout in MapScreen.js (line ~459)

2. **Network latency:**
   - Device far from computer
   - Move to same WiFi network

### Scenario: Backend returns error

1. **Check backend .env:**
   - RETELL_API_KEY valid?
   - RETELL_AGENT_ID valid?
   - Are they in quotes in .env?

2. **Test endpoint manually:**
   ```powershell
   $payload = @{
     userName = "Test"
     latitude = 12.9716
     longitude = 77.5946
     address = "Test Address"
     timestamp = "1/22/2026"
     phone = "+919876543210"
   } | ConvertTo-Json

   curl -X POST http://localhost:3000/api/sos-trigger `
     -H "Content-Type: application/json" `
     -d $payload
   ```

## 📱 Device-Specific Notes

### Android Emulator
- Uses `10.0.2.2` to reach host localhost
- No physical SIM, so Retell call may not work
- But API call should succeed

### Physical Android Phone
- Needs same WiFi as computer
- Cannot use `localhost` or `127.0.0.1`
- Must use computer's IP address: `192.168.x.x`
- For testing without WiFi: use ngrok tunnel

### With ngrok (for external testing)
```powershell
# In backend folder
ngrok http 3000

# Copy https URL from output
# Update MapScreen.js:
const BASE_URL = 'https://abc123.ngrok.io';
```

## 🚨 Emergency Fallback (Manual)

If SOS fails completely:
1. Note the error message
2. Share with SafeRaasta support with logs
3. Until fixed, user can manually call emergency contact

## 📋 Files Modified

- ✅ `src/screens/MapScreen.js` - Updated handleSOS() with proper networking
- ✅ `android/app/src/main/AndroidManifest.xml` - Already has usesCleartextTraffic
- ℹ️ Backend files (`backend/*.js`) - Already created and configured

## 🎯 Success Indicators

When everything works:
1. ✓ No "Network request failed" error
2. ✓ Backend logs show POST request received
3. ✓ Retell API called successfully
4. ✓ Success alert appears (not error alert)
5. ✓ No phone dialer opens
6. ✓ App stays in foreground
7. ✓ Logs show `✅ SOS Call triggered successfully`

---

**Ready to test?** Start backend with `npm start` and try the SOS button!
