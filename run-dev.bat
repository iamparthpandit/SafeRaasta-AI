@echo off
echo ========================================
echo React Native SafeRaasta - Dev Setup
echo ========================================
echo.

echo [1/4] Setting up ADB reverse tunnel...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8097 tcp:8097
echo.

echo [2/4] Checking Metro bundler...
tasklist /FI "WINDOWTITLE eq Metro*" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Metro is already running
) else (
    echo Starting Metro bundler...
    start "Metro Bundler" cmd /k "cd /d %~dp0 && npx react-native start"
    timeout /t 5 /nobreak >nul
)
echo.

echo [3/4] Installing app on device...
call gradlew.bat :app:installDebug -x lint
echo.

echo [4/4] Launching app...
adb shell am start -n com.saferaastaai/.MainActivity
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo If you see red error screen:
echo 1. Press R twice on keyboard, or
echo 2. Shake phone and tap Reload
echo.
pause
